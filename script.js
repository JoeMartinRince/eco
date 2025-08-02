// A simple object to hold our trip data
let trip = {
    tracking: false,
    startTime: null,
    endTime: null,
    startCoords: null,
    endCoords: null,
    distance: 0,
    mode: 'Not started',
};

const toggleButton = document.getElementById('toggleTracking');
const tripDataEl = document.getElementById('trip-data');
const smarterChoiceEl = document.getElementById('smarter-choice');
const smarterChoiceTextEl = document.getElementById('smarter-choice-text');

// Function to calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c / 1000; // in kilometers
}

// Function to simulate trip completion and display results
function endTrip() {
    trip.tracking = false;
    trip.endTime = new Date();
    
    // Get final location
    navigator.geolocation.getCurrentPosition(position => {
        trip.endCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        // Calculate final distance and duration
        if (trip.startCoords) {
            trip.distance = calculateDistance(
                trip.startCoords.latitude,
                trip.startCoords.longitude,
                trip.endCoords.latitude,
                trip.endCoords.longitude
            );
        }
        const durationSeconds = Math.round((trip.endTime - trip.startTime) / 1000);

        // Display results
        document.getElementById('distance').textContent = trip.distance.toFixed(2);
        document.getElementById('duration').textContent = durationSeconds;
        
        // This is a simplified mode detection for the prototype
        const averageSpeed = (trip.distance / durationSeconds) * 3600; // km/h
        if (averageSpeed > 10) {
            trip.mode = 'Driving';
        } else if (averageSpeed > 1) {
            trip.mode = 'Walking';
        } else {
            trip.mode = 'Stationary';
        }
        document.getElementById('mode').textContent = trip.mode;
        
        tripDataEl.style.display = 'block';
        smarterChoiceEl.style.display = 'block';
        
        // The "Smarter Choice" Engine logic for the prototype
        if (trip.mode === 'Driving' && trip.distance < 3) {
            const co2Saved = (trip.distance * 100).toFixed(0); // A rough estimate
            const caloriesBurned = (trip.distance * 40).toFixed(0); // A rough estimate
            const walkingTime = Math.round((trip.distance / 5) * 60); // Assuming 5 km/h walking speed
            
            smarterChoiceTextEl.innerHTML = `Your ${trip.distance.toFixed(1)} km drive could have been a <strong>${walkingTime}-minute walk</strong>. This would have saved approximately <strong>${co2Saved}g of CO₂</strong> and burned about <strong>${caloriesBurned} calories</strong>! Up for the challenge?`;
        } else if (trip.mode === 'Driving') {
            smarterChoiceTextEl.textContent = `Your trip was too long to be a walk, but a bus or cycle could still be a great option!`;
        } else {
            smarterChoiceTextEl.textContent = `Great choice! You chose a sustainable travel option for this trip.`;
        }

        // Reset for the next trip
        trip = {
            tracking: false,
            startTime: null,
            endTime: null,
            startCoords: null,
            endCoords: null,
            distance: 0,
            mode: 'Not started',
        };
        toggleButton.textContent = 'Start Trip';
        toggleButton.style.backgroundColor = '#2ecc71';
    }, error => {
        console.error("Error getting location:", error);
    });
}

// Event listener for the button
toggleButton.addEventListener('click', () => {
    if (!trip.tracking) {
        // Start a new trip
        trip.tracking = true;
        trip.startTime = new Date();
        
        // Get initial location
        navigator.geolocation.getCurrentPosition(position => {
            trip.startCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            console.log("Trip started at:", trip.startCoords);
        }, error => {
            console.error("Error getting location:", error);
            alert("Could not get your location. Please check your browser settings.");
            trip.tracking = false; // Cancel tracking if location fails
        });
        
        toggleButton.textContent = 'End Trip';
        toggleButton.style.backgroundColor = '#e74c3c';
        tripDataEl.style.display = 'none';
        smarterChoiceEl.style.display = 'none';

    } else {
        // End the current trip
        endTrip();
    }
});
