import os
print("Condensing stops")
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

try:
    # Stop times has a new line for every stop in a trip, so instead, loop through until
    # the trip is over, then add all stops in one line
    # Instead of: id, stopId, time, 0
    #             id, stopId, time, 1 etc...
    # Make it id, stopId0, stopId1...
    for i in types:
        lastId = ""
        currentStops = []
        count = 0

        with open(i + "/stop_times.txt", "r") as stops:
            for line in stops.readlines():
                sinceLast = 0
                if count == 0:
                    lastId = line.split(",")[0]
                    count = 1
                if line.split(",")[0] != lastId:
                    if sinceLast == 0:
                        currentStops.append(line.split(",")[1].replace("\n", "").replace("\r", ""))
                    with open(i + "/stops_order.txt", "a") as new:
                        new.write(lastId + "," + ','.join(str(x) for x in currentStops) + "\n")
                    lastId = line.split(",")[0]
                    currentStops = []
                else:
                    sinceLast += 1
                    currentStops.append(line.split(",")[1].replace("\n", "").replace("\r", ""))

        with open(i + "/stops_order.txt", "a") as new:
            new.write(lastId + "," + ','.join(str(x) for x in currentStops) + "\n")
except:
    print("!!!!!\n\nCompressing stops failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)

try:
    print("Sorting stop files for binary search")
    for i in types:
        ids = []
        order = []

        # Grab just the ID's for sorting
        with open(i + "/stops_order.txt", "r") as stopOrder:
            lines = stopOrder.readlines()
            for line in lines:
                ids.append(line[:30].split(",")[0])

        # Sort the ID's, write the ID's line to an array, the make the file equal to the array
        sortedIds = sorted(ids)
        for item in sortedIds:
            order.append(ids.index(item))

        newLines = [lines[i] for i in order]
        open(i + "/stops_order.txt", 'w').writelines(newLines)
except:
    print("!!!!!\n\nSorting stops failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)