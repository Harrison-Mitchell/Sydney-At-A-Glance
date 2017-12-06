print("Smashing data together")
import bisect, os
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

try:
	for i in types:
		print("Compressing", i)
		toAdd = []
		iteration = 0
		stopIds = []
		with open(i + "/stops_order.txt", "r") as stops:
			stopLines = stops.readlines()
			for line in stopLines:
				stopIds.append(str(line[:35].split(",")[0]))
		with open(i + "/trips.txt", "r") as trips:
			# Find trips to loop over
			myTrips = trips.readlines()
			# Find number of lines for progress report
			numLines = len(myTrips)
		for trip in myTrips:
			new = ""
			iteration += 1
			if trip != "":
				# Escape non-splitting commas with _
				if "\"" in trip:
					quotLoc1 = trip.index("\"")
					quotLoc2 = trip[quotLoc1 + 1:].index("\"") + quotLoc1 + 2
					replacement = trip[quotLoc1:quotLoc2].replace(",", "_").replace("\"", "")
					trip = trip[:quotLoc1] + replacement + trip[quotLoc2:]
				if "\"" in trip:
					quotLoc1 = trip.index("\"")
					quotLoc2 = trip[quotLoc1 + 1:].index("\"") + quotLoc1 + 2
					replacement = trip[quotLoc1:quotLoc2].replace(",", "_").replace("\"", "")
					trip = trip[:quotLoc1] + replacement + trip[quotLoc2:]
				if "\"" in trip:
					trip = trip.replace("\"", "")
				tripInfo = trip.split(",")
				routeId = tripInfo[0]
				serviceId = tripInfo[1]
				new += tripInfo[2] + "," + tripInfo[0] + "," + tripInfo[5] + "," + tripInfo[4] + ","
				# If we don't have the direction_id, assume outbound since the data is missing
				try:
					new += tripInfo[6] + "," + tripInfo[7] + "," + tripInfo[3] + ","
				except:
					new += tripInfo[6] + ",0," + tripInfo[3] + ","

				# Routes is a small file, so go line by line and find relevent info
				with open(i + "/routes.txt", "r") as routes:
					for line in routes.readlines():
						if line.split(",")[0] == routeId:
							agencyId = line.split(",")[1]
							new += line.split(",")[2] + "," + line.split(",")[3] + ","
							break

				# Agency is a tiny file, so go line by line and find relevent info
				with open(i + "/agency.txt", "r") as agency:
					for line in agency.readlines():
						if line.split(",")[0] == agencyId:
							new += line.split(",")[1] + ","
							break

				# Calendar is a small file, so go line by line and find relevent info
				with open(i + "/calendar.txt", "r") as calendar:
					for line in calendar.readlines():
						if line.split(",")[0] == serviceId:
							splitLine = line.split(",")
							new += splitLine[1] + "," + splitLine[2] + "," + splitLine[3] + "," + splitLine[4] + ","
							new += splitLine[5] + "," + splitLine[6] + "," + splitLine[7] + ","
							break

				# stopIds is a huge file, so do a binary search instead to save time
				lineLoc = bisect.bisect_left(stopIds, str(tripInfo[2]))
				try:
					new += stopLines[lineLoc][len(stopLines[lineLoc][:35].split(",")[0]) + 1:]
				except:
					print("Binary search failed, falling back on linear")
					print(tripInfo[2])
					for line in stopLines:
						if line[:35].split(",")[0] == tripInfo[2]:
							print(line[:35])
							print(line)
							print(tripInfo[2])
							print(line[len(line[:35].split(",")[0]) + 1:])
							new += line[len(line[:35].split(",")[0]) + 1:]
							break

				# In case there is a place of empty data, replace it with "No Information"
				toAdd.append(new.replace("\n", "").replace("\r", "").replace(",,", ",No Information,") + "\n")

				# If we have processed 1500 times, write all 1500 items to the new crammed file
				# This saves time by only writing to the file every so often and not ~700,000 times
				if iteration % 1500 == 0:
					print(str(round(iteration / numLines * 100, 2)) + "%")
					with open(i + "/info.txt", "a") as info:
						for add in toAdd:
							info.write(add)
					toAdd = []

		# If we're done but we haven't written some data because it was less than 1500 items, write it
		with open(i + "/info.txt", "a") as info:
			for add in toAdd:
				info.write(add)
		print("100%,", i, "done!")
except:
    print("!!!!!\n\nGenerate info failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)