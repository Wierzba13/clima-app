const getCoordinates = (callback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates = {
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                };
                callback(null, coordinates);
            },
            (error) => {
                callback(error, null);
            }
        );
    } else {
        const error = new Error("Twoja przeglądarka nie obsługuje geolokalizacji.");
        callback(error, null);
    }
}

export default getCoordinates;