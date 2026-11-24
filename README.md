 ParkFinder

ParkFinder is a simple, responsive web application that helps shoppers remember where they parked their vehicles in a mall. Users can save their vehicle registration number along with the mall, parking floor, zone, and bay number, then search by registration number to find the saved parking location.

## Features

- **Save parking location:** Enter a vehicle registration number and choose a mall, floor, zone, and parking bay.
- **Find vehicle by number plate:** Search for a saved vehicle and view its parking details.
- **Interactive parking maps:** Select a bay on the map or use the dropdown menus.
- **Parking directions:** View a simplified route from the lifts to the saved bay.
- **Optional services:** Mark car washing or EV charging as requested.
- **Saved vehicles:** View saved parking records on the home page.
- **Offline-friendly storage:** Parking records are stored in the browser using `localStorage`; no account or server is required.
- **Responsive design:** The layout adapts to desktop and mobile screens.
- **Light and dark appearance:** Uses the device color-scheme preference and supports theme styling.

## Supported malls

### Palladium Mall
- Floors: B1, B2, B3
- Zone A: bays 1–60
- Zone B: bays 61–120
- Zone C: bays 121–180
- Zone D: bays 181–240
- Zone E: bays 241–315
- In the floor selector, B1 displays zones A and B, B2 displays C and D, and B3 displays E.

### Alpha Mall
- Floors: B1, B2
- Zones: A to G
- Each zone has bays 1–15.
- B1 displays zones A, B, C, and D; B2 displays zones E, F, and G.

### TRP Mall
- Floors: Ground, B1, B2, B3, B4
- East Court, Center Court, and South Court
- Each court has 90 bays.

## Technologies used

- HTML5
- CSS3
- JavaScript
- Browser `localStorage`
- SVG for the parking maps

## How to run the project

1. Download or clone this repository.
2. Open the project folder.
3. Open `parkfinder-FIXED-with-map.html` in a modern web browser.

No installation, build tools, or backend server are required.

## Demo

The app includes a sample saved vehicle:

- Registration number: `GJ 05 AB 1234`
- Mall: Palladium Mall
- Floor: B2
- Zone: B
- Bay: 84

Open **Find vehicle** and search for `GJ 05 AB 1234` to try the demo.

The **Scan plate** button is a demonstration only; it simulates reading a sample number plate and does not access a real camera.

## Important notes

- Saved parking information stays in the current browser on the current device.
- Data is not synchronized between devices or browsers.
- Clearing browser/site data may delete saved parking records.
- The parking maps are simplified illustrations and are not official mall floor plans or to scale.
- The route is a visual guide inside the simplified map, not live indoor navigation.

## Future improvements

- Add real camera-based number plate scanning.
- Add official mall parking layouts and accurate indoor navigation.
- Add secure cloud backup and synchronization across devices.
- Add real-time parking availability.

## License

No license has been specified for this project. Add a license file if you plan to publish or share the project for reuse.
