// src/utils/timeValidation.js

const DAYS_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const isRestaurantOpen = (dateObj, openingHoursJson) => {
    if (!openingHoursJson) return true; // If no hours set, assume open (or handle as closed)

    let schedule;
    try {
        schedule = JSON.parse(openingHoursJson);
    } catch (e) {
        console.error("Failed to parse opening hours", e);
        return true; // Fallback
    }

    const dayName = DAYS_MAP[dateObj.getDay()]; // e.g. "MONDAY"
    const daySlots = schedule[dayName];

    // If no slots or empty array, it's closed all day
    if (!daySlots || daySlots.length === 0) {
        return false;
    }

    // Convert selected time to minutes for easy comparison
    // e.g. 13:30 -> 13 * 60 + 30 = 810 minutes
    const selectedMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();

    // Check if the time falls within ANY of the slots for today
    const isOpen = daySlots.some(slot => {
        const [openHour, openMin] = slot.open.split(':').map(Number);
        const [closeHour, closeMin] = slot.close.split(':').map(Number);

        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        return selectedMinutes >= openMinutes && selectedMinutes <= closeMinutes;
    });

    return isOpen;
};

// Helper to format the next available slot for a friendly error message
export const getNextOpenSlotMessage = (dateObj, openingHoursJson) => {
    // This is complex to calculate perfectly across days, 
    // for now we can just return a generic message or the hours for today.
    return "The restaurant is closed at this time. Please check the Opening Hours.";
};

// NEW Helper: Check if the restaurant is open AT ALL on this specific day
export const isRestaurantOpenOnDay = (dateObj, openingHoursJson) => {
    if (!openingHoursJson) return true;
    let schedule;
    try { schedule = JSON.parse(openingHoursJson); } catch (e) { return true; }

    const dayName = DAYS_MAP[dateObj.getDay()];
    const daySlots = schedule[dayName];
    
    // If array exists and has length > 0, it's open that day
    return daySlots && daySlots.length > 0;
};

export const getFirstOpenSlot = (dateObj, openingHoursJson) => {
    if (!openingHoursJson) return dateObj; // No data, keep original
    let schedule;
    try { schedule = JSON.parse(openingHoursJson); } catch (e) { return dateObj; }

    const dayName = DAYS_MAP[dateObj.getDay()];
    const daySlots = schedule[dayName];

    if (!daySlots || daySlots.length === 0) return null; // Closed all day

    // Get the first slot's open time
    const firstSlot = daySlots[0];
    const [openHour, openMin] = firstSlot.open.split(':').map(Number);

    // Create a new date object with the same Y-M-D but the opening time
    const newDate = new Date(dateObj);
    newDate.setHours(openHour);
    newDate.setMinutes(openMin);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
};