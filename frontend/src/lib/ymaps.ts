export async function ymapsDirectGeocode(text: string) {
    if (!window.ymaps) {
        return {
            address: text,
            coords: [0, 0],
            valid: false,
            checked: false,
        };
    }

    await window.ymaps.ready();

    try {
        const result = await ymaps.geocode(text, {
            results: 1,
        });
        const coords = result.geoObjects.get(0).geometry.getCoordinates();

        return {
            address: text,
            valid: true,
            checked: true,
            coords,
        };
    } catch {
        return {
            address: text,
            valid: false,
            checked: true,
            coords: [0, 0],
        };
    }
}
