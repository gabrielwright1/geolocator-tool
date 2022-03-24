// namespace object
const app = {};

// api key
app.key = "HE7AqVUfwsJ0zRE94lHGOmOA16A5JBAp";

// empty array to store references to the markers
app.markerList = [];

// positioning of popup relative to markers on map
app.popupOffsets = {
	top: [0, 0],
	bottom: [0, -70],
	"bottom-right": [0, -70],
	"bottom-left": [0, -70],
	left: [25, -35],
	right: [-25, -35],
};

// detect the user's location using their IP address
app.getUserLocation = () => {
	// Set default coordinates
	app.lat = 43.6547;
	app.lon = -79.3623;
	// build the map based on the user's position
	app.createMap(app.lat, app.lon);
};

// query for address details (results are biased towards the users' location)
app.getGeocodes = (address) => {
	$.ajax(
		`https://api.tomtom.com/search/2/geocode/${address}.JSON?key=${app.key}&lat=${app.lat}&lon=${app.lon}`
	).then((res) => {
		// create a marker for every query result
		app.createMarkers(res.results);
	});
};

// build a vector map using the TomTom SDK
app.createMap = (lat, lon) => {
	// make map globally available in the namespace
	app.map = tt.map({
		key: app.key,
		container: "map",
		basePath: "sdk/",
		center: [lon, lat],
		zoom: 3,
		theme: {
			style: "buildings",
			layer: "basic",
			source: "vector",
		},
	});
	// add UI zoom controls to the map
	app.map.addControl(new tt.NavigationControl());
};

// add a marker to the map and the markerList array
app.addMarker = (result) => {
	// destructure the lat/lon out of the results
	const { lat } = result.position;
	const { lon } = result.position;
	// create a marker on the map
	const marker = new tt.Marker({
		draggable: false,
	})
		.setLngLat([lon, lat])
		.addTo(app.map);

	// push the marker into our global array
	app.markerList.push(marker);

	// return an object
	return { marker, result };
};

// update the popup's text content with the results of the query
app.updatePopup = (popup, result) => {
	// destructure the address details
	const { streetNumber } = result.address;
	const { streetName } = result.address;
	const { municipality } = result.address;
	const { countrySubdivisionName } = result.address;
	const { country } = result.address;
	const { extendedPostalCode } = result.address;

	// set the popups' text content
	popup.setHTML(`
  <p id='popup'>
    ${streetNumber} ${streetName}<br>
    City: ${municipality}<br>
    Province/State: ${countrySubdivisionName}<br>
    Country: ${country}<br>
    Postal/ZIP: ${extendedPostalCode}<br>
  </p>`);
};

// add a popup to the marker
app.addPopup = (location) => {
	// destructure the location object
	const { result } = location;
	const { marker } = location;
	// create a popup
	const popup = new tt.Popup({ offset: app.popupOffsets });
	// position the popup above the marker
	marker.setPopup(popup);
	// fill in the popup with details about the location
	app.updatePopup(popup, result);
};

app.createMarkers = (results) => {
	//loop over the results, and create a marker for each one
	results.forEach((result) => {
		// create a marker for every result
		app.marker = app.addMarker(result);
		// create a popup above every marker
		app.addPopup(app.marker);
	});
};

// clear the markers/popups from the map
app.clearMap = () => {
	// loop over the marker array and call the remove method
	app.markerList.forEach((marker) => {
		marker.remove();
	});
};

app.init = () => {
	// detect and center a map on the users location
	app.getUserLocation();
	// target the form
	$("form").on("submit", (event) => {
		event.preventDefault();
		// clear the existing markers
		app.clearMap();
		// pass in the address into the geocoding api request
		const address = $("input:text").val();
		app.getGeocodes(encodeURIComponent(address));
	});
};

$(() => {
	app.init();
});
