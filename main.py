#STAR 1
#-------------------------------------------

"""file = open("input.txt", "r")
lines = file.readlines()
totalArr = []
for line in lines:
    winningNumbers = []
    cardNumbers = []
    LSide = True
    for val in line.split(" "):
        val = val.strip("\n")
        if val != "|":
            if ":" in list(val):
                continue
            elif val.isdigit() and LSide:
                winningNumbers.append(val)
            elif val.isdigit():
                cardNumbers.append(val)
        else:
            LSide = False
    Total = 0
    Found = 0
    for num in cardNumbers:
        if num in winningNumbers:
            if Found < 1:
                Total += 1
                Found = 2
            else:
                Total *= 2
    totalArr.append(Total)
t = 0
for totals in totalArr:
    t += totals
print(t)"""

#STAR 2
#-------------------------------------------

file = open("input.txt", "r")
lines = file.readlines()
totalArr = []
WinCardCount = []

cardMultiplier = [1] * 6

for line in lines:
    winningNumbers = []
    cardNumbers = []
    LSide = True
    for val in line.split(" "):
        val = val.strip("\n")
        if val != "|":
            if ":" in list(val):
                continue
            elif val.isdigit() and LSide:
                winningNumbers.append(val)
            elif val.isdigit():
                cardNumbers.append(val)
        else:
            LSide = False
    Total = 0
    Found = 0
    WinNumCount = 0
    for num in cardNumbers:
        if num in winningNumbers:
            WinNumCount += 1
    WinCardCount.append(WinNumCount)

InstanceCount = [1] * 6
for i in range(0, len(WinCardCount)):#loop through count
    for j in range(i + 1, i + WinCardCount[i] + 1):#loop through so that 
        #print(str(j) + "    " + str(i))
        InstanceCount[j] += 1
print(InstanceCount)
t = 0
for val in InstanceCount:
    t += val
print(t)