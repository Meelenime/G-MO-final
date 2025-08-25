# Eleni Mekonnen
# 8/21/2025
# CSCI 391-01
# imperative Python code implementation of an array-based heap act 2
# w/ list of dict representing students and scores print only the names of top 5 who score above 70, high to low

students = [
    {"name": "Mary", "score":82},
    {"name": "Bob", "score":65},
    {"name": "Wayne", "score":91},
    {"name": "Don", "score":74},
    {"name": "Ethan", "score":59},
    {"name": "Rob", "score":88},
    {"name": "George", "score":95},
    {"name": "Ava", "score":70},
    {"name": "Johnny", "score":73},
]

filter_s = []
for student in students:
     if students["score"]>70:
          filter_s.append(student)

for i in range (len(filter_s)):
    for j in range (i+1, len(filter_s)):
         if filter_s[j]["score"] > filter_s[i]["score"]:
              filter_s[i], filter_s[j] = filter_s[j], filter_s[i]

top_s = []
counter = 0

for students in filter_s:
     if counter < 5:
          top_s.append(student["name"])
          counter += 1

print("The top 5 students are: ", top_s)