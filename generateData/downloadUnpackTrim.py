print("**If errors are consistently produced between days, it's possible the data has changed format. The program will run fine without running this update tool it's just that you won't be able to click on a vehicle and see it's information, stops and shape\n**")
import urllib.request, shutil, zipfile, pandas, csv, os
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

#
#   Download
#
print("This update tool should take anywhere from 10 to 15 minutes")
print("Downloading about 120mb of timetables and stops")
for i in types:
	try:
		url = 'https://api.transport.nsw.gov.au/v1/gtfs/schedule/' + i
		headers = {"Authorization": "apikey l7xxdd534960a59c41b2b645de58f795a81b"}
		req = urllib.request.Request(url, headers = headers)
		with urllib.request.urlopen(req) as response:
			with open(i + ".zip", 'wb') as out_file:
				shutil.copyfileobj(response, out_file)
	except:
		print(i, "had trouble downloading, please try again momentarily")
		exit()

#
#   Unpack
#

print("Unzipping the downloads")
for i in types:
	try:
		with zipfile.ZipFile(i + ".zip","r") as zip_ref:
			zip_ref.extractall(i)
	except:
		print(i, "failed to unzip, please try again momentarily")
		exit()

#
#   Trim
#

print("Making files lighter")
os.remove("nswtrains/feed_info.txt")

for i in types:
	try:
		os.remove(i + "/calendar_dates.txt")
	except:
		pass
	try:
		os.remove(i + "/notes.txt")
	except:
		pass

	try:
		# Shave columns off that we don't need
		currentFile = pandas.read_csv(i + "/agency.txt")
		newFile = currentFile.reindex(columns=["agency_id","agency_name"])
		newFile.to_csv(i + "/agency.txt", index=False, header=False)

		currentFile = pandas.read_csv(i + "/calendar.txt")
		newFile = currentFile.reindex(columns=["service_id","monday","tuesday","wednesday","thursday","friday","saturday","sunday"])
		newFile.to_csv(i + "/calendar.txt", index=False, header=False)

		currentFile = pandas.read_csv(i + "/routes.txt")
		newFile = currentFile.reindex(columns=["route_id","agency_id","route_short_name","route_desc"])
		newFile.to_csv(i + "/routes.txt", index=False, header=False)

		currentFile = pandas.read_csv(i + "/shapes.txt")
		newFile = currentFile.reindex(columns=["shape_id","shape_pt_lat","shape_pt_lon","shape_pt_sequence"])
		if i == "ferries":
			newFile = newFile.sort_values("shape_id")
		newFile.to_csv(i + "/shapes.txt", index=False, header=False)
		if i == "ferries":
			# Due to the inconsistencies of the data, ferries is in a different format, so reformat it
			os.rename(i + "/shapes.txt", i + "/shapes_old.txt")
			with open(i + "/shapes_old.txt", "r") as oldShapes:
				for a in oldShapes.readlines():
					a = a.split(",")
					with open(i + "/shapes.txt", "a") as newShapes:
						newShapes.write(a[0][:2] + "," + a[1] + "," + a[2] + "," + str(int(a[0][2:]) - 100) + "\n")

		currentFile = pandas.read_csv(i + "/stop_times.txt")
		newFile = currentFile.reindex(columns=["trip_id","stop_id"])
		if i == "ferries":
			newFile = newFile.sort_values("trip_id")
		newFile.to_csv(i + "/stop_times.txt", index=False, header=False)

		currentFile = pandas.read_csv(i + "/stops.txt")
		newFile = currentFile.reindex(columns=["stop_id","stop_name","stop_lat","stop_lon"])
		newFile.to_csv(i + "/stops.txt", index=False, header=False)

		currentFile = pandas.read_csv(i + "/trips.txt")
		if i != "sydneytrains" or i != "ferries":
			newFile = currentFile.reindex(columns=["route_id","service_id","trip_id","trip_headsign","direction_id","shape_id","wheelchair_accessible","route_direction"])
		else:
			newFile = currentFile.reindex(columns=["route_id","service_id","trip_id","trip_headsign","direction_id","shape_id","wheelchair_accessible"])
		newFile.to_csv(i + "/trips.txt", index=False, header=False)
	except:
		print("Failure to remove some colums, try again, otherwise format has changed and code is broken")
print("Not much I can do about that error ^")
# try:
import generateStops, generateInfo, generateShapes, cleanStops, generateCameras, cleanFiles
# except:
	# print("Problem stringing processes")