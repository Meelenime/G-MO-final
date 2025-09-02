document.addEventListener('DOMContentLoaded', () => {
    // Functionality for the "My Farm" page
    const farmZones = document.querySelectorAll('.zone-field');
    
    // Add event listeners to each farm zone in the SVG
    farmZones.forEach(zone => {
        zone.addEventListener('click', (e) => {
            const zoneId = e.target.id;
            // The following alert has been commented out to conform with best practices.
            // console.log(`You clicked on ${zoneId}!`);
        });
    });

    // Chat page functionality, as requested by the user.
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');

    if (sendButton && messageInput && chatMessages) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sent');
            messageElement.innerHTML = `<p>${messageText}</p>`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
            messageInput.value = ''; // Clear input
        }
    }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db;
let auth;
let userId;
let isAuthReady = false;
let currentForum = '';

function showModal(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto text-center">
            <p class="text-gray-800 mb-4">${message}</p>
            <button id="modal-ok" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('modal-ok').onclick = () => document.body.removeChild(modal);
}

window.addEventListener('load', async () => {
    try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        if (Object.keys(firebaseConfig).length === 0) {
            throw new Error("Firebase config is missing.");
        }

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        setLogLevel('debug');

        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                isAuthReady = true;
                updateUserIdDisplay();
            } else {
                isAuthReady = true;
                updateUserIdDisplay();
            }
        });
        
    } catch (e) {
        console.error("Firebase initialization error:", e);
        showModal("Failed to initialize the app. Check the console for details.");
    }
});

function updateUserIdDisplay() {
    const displayElement = document.getElementById('user-id-display');
    if (displayElement) {
        displayElement.textContent = `User ID: ${userId || '(anonymous)'}`;
    }
}

const FORUMS_VIEW = 'forums-view';
const CHAT_VIEW = 'chat-view';

function navigateTo(view, forumId = null) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    if (view === FORUMS_VIEW) {
        renderForumsView(mainContent);
        currentForum = '';
    } else if (view === CHAT_VIEW && forumId) {
        currentForum = forumId;
        renderChatView(mainContent, forumId);
        setupRealtimeChat(forumId);
    }
}

function renderForumsView(container) {
    container.innerHTML = `
        <section class="greeting">
            <h1>Community Forums</h1>
        </section>
        <section class="insights-section">
            <h2>Choose a Forum</h2>
            <p>Connect with other farmers on topics you care about.</p>
        </section>
        <section style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <button class="forum-card" onclick="navigateTo('chat-view', 'soil')">
                <i class="fa-solid fa-seedling forum-icon"></i>
                <span class="font-semibold">Soil</span>
            </button>
            <button class="forum-card" onclick="navigateTo('chat-view', 'farm-machinery')">
                <i class="fa-solid fa-tractor forum-icon"></i>
                <span class="font-semibold">Farm Machinery</span>
            </button>
            <button class="forum-card" onclick="navigateTo('chat-view', 'crops')">
                <i class="fa-solid fa-wheat-awn forum-icon"></i>
                <span class="font-semibold">Crops</span>
            </button>
            <button class="forum-card" onclick="navigateTo('chat-view', 'cattle')">
                <i class="fa-solid fa-cow forum-icon"></i>
                <span class="font-semibold">Cattle</span>
            </button>
            <button class="forum-card" onclick="navigateTo('chat-view', 'local-farms')">
                <i class="fa-solid fa-location-dot forum-icon"></i>
                <span class="font-semibold">Local Farms Data</span>
            </button>
        </section>
    `;
}

function renderChatView(container, forumId) {
    const forumTitle = forumId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    container.innerHTML = `
        <div class="back-link" onclick="navigateTo('forums-view')">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Back to Forums</span>
        </div>
        <h2>${forumTitle} Forum</h2>
        <div id="chat-messages" class="chat-messages scroll-container">
            <!-- Messages will be dynamically added here -->
        </div>
        <div class="chat-input-container">
            <input type="text" id="message-input" placeholder="Type your message...">
            <button id="send-button">
                Send
            </button>
        </div>
    `;
}

function setupRealtimeChat(forumId) {
    if (!isAuthReady) {
        console.warn("Auth not ready. Skipping chat setup.");
        return;
    }

    const chatMessagesDiv = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    const publicChatCollectionPath = `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/public/data/forums/${forumId}/messages`;
    const publicChatCollection = collection(db, publicChatCollectionPath);

    const q = query(publicChatCollection, orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        chatMessagesDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const messageData = doc.data();
            const messageElement = document.createElement('div');
            const isCurrentUser = messageData.userId === userId;
            const timestamp = messageData.timestamp ? new Date(messageData.timestamp.seconds * 1000).toLocaleString() : 'Just now';
            
            messageElement.classList.add('message-bubble');
            if (isCurrentUser) {
                messageElement.classList.add('mine');
            } else {
                messageElement.classList.add('other');
            }
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span>${isCurrentUser ? 'You' : messageData.userId}</span>
                    <span>${timestamp}</span>
                </div>
                <p class="message-content">${messageData.text}</p>
            `;
            
            chatMessagesDiv.appendChild(messageElement);
        });
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }, (error) => {
        console.error("Error getting real-time messages: ", error);
        showModal("Error loading messages. Check the console for details.");
    });

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") return;

        try {
            await addDoc(publicChatCollection, {
                userId: userId,
                text: text,
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (e) {
            console.error("Error adding document: ", e);
            showModal("Failed to send message. Check the console for details.");
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

window.onload = () => {
    navigateTo(FORUMS_VIEW);
};
