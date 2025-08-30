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
