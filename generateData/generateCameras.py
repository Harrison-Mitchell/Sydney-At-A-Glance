import urllib.request, shutil, json, os, datetime
print("Scrape the web to check if there are new traffic cameras available")
try:
	# Download the camera JSON and save it locally
	url = 'http://data.livetraffic.com/cameras/traffic-cam.json'
	req = urllib.request.Request(url)
	with urllib.request.urlopen(req) as response:
		with open("cameras.json", 'wb') as out_file:
			shutil.copyfileobj(response, out_file)

	with open("cameras.json") as myFile:
		json_data = myFile
		jdata = json.load(json_data)

	hrefs = []

	# Start the JS file
	with open('camInfo.js', 'w') as file:
		file.write("var trafficCams = [")
		# Then write x,y,description,url,direction
		for p in jdata["features"]:
			file.write("\n" + str([p["geometry"]["coordinates"], p["properties"]["view"], p["properties"]["href"], p["properties"]["direction"]]) + ",")
			hrefs.append('"' + p["properties"]["href"] + '"')

	# Remove last comma
	with open('camInfo.js', 'rb+') as file:
		file.seek(-1, os.SEEK_END)
		file.truncate()

	# End JS file
	with open('camInfo.js', 'a') as file:
		file.write("];")
	
	# Write a file the main program can read with today's date so it knows the data is up to date, otherwise we need
	# to ask the user to run this tool and update the data
	print("Ensuring the program can see the last time the data was updated")
	dateString = datetime.datetime.now().strftime("%d %m %Y")
	# Remove leading zeros
	dateString = str(int(dateString.split(" ")[0])) + " " + str(int(dateString.split(" ")[1])) + " " + str(int(dateString.split(" ")[2]))
	open("../assets/scripts/updated.js", "w").write("var lastUpdate = \"" + dateString + "\";")
except:
    print("!!!!!\n\nGenerate cameras failed spectacularly, restore original file system (extract original zip again)\n\n!!!!!")
    os._exit(0)