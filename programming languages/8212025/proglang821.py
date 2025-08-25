#Eleni Mekonnen
#8/21/2025
#declaritive programming to find the sum of all numbers greater than 10 on a list

declar_list = [3, 7, 12, 18, 5, 21, 12, 19, 1]
sum = 0

for n in range(len(declar_list)):
    if declar_list[n] > 10:
        sum += declar_list[n]


print(sum)

