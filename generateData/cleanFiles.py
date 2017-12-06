import os, shutil
print("Removing excess files, moving others and making old files new")
types = ["buses","ferries","lightrail","nswtrains","sydneytrains"]

try:
    # Instead of running the script from the generateData folder, run it from the project folder
	os.chdir('..')
	# Delete old camInfo and replace with new, delete json artifact from camera generation
	try:
		os.remove("assets/scripts/camInfo.js")
	except:
		pass
	os.remove("generateData/cameras.json")
	os.rename("generateData/camInfo.js", "assets/scripts/camInfo.js")

	for i in types:
		# Replace vehicleData folder with new info, delete old zips and uneeded files
		shutil.rmtree("assets/vehicleData/" + i)
		os.mkdir("assets/vehicleData/" + i)
		os.rename("generateData/" + i, "generateData/" + i + "old")
		os.mkdir("generateData/" + i)
		os.rename("generateData/" + i + "old/stops.txt", "assets/vehicleData/" + i + "/stops.txt")
		os.rename("generateData/" + i + "old/info.txt", "assets/vehicleData/" + i + "/info.txt")
		os.rename("generateData/" + i + "old/shapes.txt", "assets/vehicleData/" + i + "/shapes.txt")
		os.remove("generateData/" + i + ".zip")
		shutil.rmtree("generateData/" + i + "old")
		shutil.rmtree("generateData/" + i)
		
	print("The update tool has finished succesessfully!")
except:
    print("!!!!!\n\nCleaning process failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)