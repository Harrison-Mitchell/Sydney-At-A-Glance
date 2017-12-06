import os, math

print("Condensing shapes")
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

try:
    # See condensing stops information, same principal applies here but instead of stopIds it's x,y's
    for i in types:
        lastId = ""
        currentXY = []
        count = 0

        os.rename(i + "/shapes.txt", i + "/shapes_old2.txt")

        with open(i + "/shapes_old2.txt", "r") as shapesRaw:
            for line in shapesRaw.readlines():
                if count == 0:
                    lastId = line.split(",")[0]
                count += 1
                splitLine = line.split(",")
                if splitLine[0] != lastId and count != 1:
                    with open(i + "/shapes.txt", "a") as new:
                        new.write(lastId + "," + ','.join(str(x) for x in currentXY) + "\n")
                    lastId = splitLine[0]
                    currentXY = [] # Clear the array so it's not cumulative and doesn't produce a 370GB file... whoops
                else:
                    currentXY.append(splitLine[1].split(".")[0] + "." + splitLine[1].split(".")[1][:6])
                    currentXY.append(splitLine[2].split(".")[0] + "." + splitLine[2].split(".")[1][:6])
except:
    print("!!!!!\n\nCondensing shapes failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)