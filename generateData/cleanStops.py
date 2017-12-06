import os
print("Cleaning stops")
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

try:
    # Essentially, replace non-seperating commas with _ to prevent parsing braking later
    for i in types:
        newLines = []
        os.rename(i + "/stops.txt", i + "/stops_old.txt")
        with open(i + "/stops_old.txt", "r") as stops:
            for stop in stops.readlines():
                stop = stop.replace("\n", "").replace("\r", "")
                if "\"" in stop:
                    quotLoc1 = stop.index("\"")
                    quotLoc2 = stop[quotLoc1 + 1:].index("\"") + quotLoc1 + 2
                    replacement = stop[quotLoc1:quotLoc2].replace(",", "_").replace("\"", "")
                    stop = stop[:quotLoc1] + replacement + stop[quotLoc2:]
                splitStop = stop.split(",")
                newLines += splitStop[0] + "," + splitStop[1] + "," + splitStop[2][:10] + "," + splitStop[3][:10] + "\n"
        open(i + "/stops.txt", "w").writelines(newLines)
except:
    print("!!!!!\n\nClean stops failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)