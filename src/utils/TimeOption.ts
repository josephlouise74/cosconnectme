import { addMinutes } from "date-fns";

// Define types for our data structures
export interface TimeSlot {
    start: string;
    end: string;
}

export interface AvailabilityDate {
    date: string;
    timeSlots: TimeSlot[];
}

export interface TimeOption {
    value: string;
    label: string;
}

// Generate time slots from 8 AM to 10 PM in 30-minute intervals based on Philippine time
export const generateTimeOptions = (): TimeOption[] => {
    const timeOptions: TimeOption[] = [];

    // Start from 8:00 AM
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0);

    // End at 10:00 PM
    const endTime = new Date();
    endTime.setHours(22, 0, 0, 0);

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();

        const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
        const period = hours < 12 ? "AM" : "PM";
        const formattedMinute = minutes === 0 ? "00" : minutes;

        const value = `${hours.toString().padStart(2, "0")}:${formattedMinute.toString().padStart(2, "0")}`;
        const label = `${formattedHour}:${formattedMinute} ${period}`;

        timeOptions.push({ value, label });

        // Add 30 minutes
        currentTime = addMinutes(currentTime, 30);
    }

    return timeOptions;
};

export const TIME_OPTIONS = generateTimeOptions();

// Convert a time value to a 12-hour format label
export const formatTimeLabel = (timeValue: string): string => {
    const timeParts = timeValue.split(":");
    const hours = parseInt(timeParts[0] as any, 10);
    const minutes = timeParts[1];

    const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
    const period = hours < 12 ? "AM" : "PM";

    return `${formattedHour}:${minutes} ${period}`;
};

// Predefined availability templates
export const AVAILABILITY_TEMPLATES = [
    {
        name: "Business Hours",
        slots: [{ start: "09:00", end: "17:00" }]
    },
    {
        name: "Morning Only",
        slots: [{ start: "08:00", end: "12:00" }]
    },
    {
        name: "Afternoon Only",
        slots: [{ start: "13:00", end: "17:00" }]
    },
    {
        name: "Evening Only",
        slots: [{ start: "18:00", end: "22:00" }]
    },
    {
        name: "Full Day",
        slots: [{ start: "08:00", end: "22:00" }]
    },
    {
        name: "Split Schedule",
        slots: [
            { start: "09:00", end: "12:00" },
            { start: "14:00", end: "19:00" }
        ]
    }
];

// Find a time option by its value
export const findTimeOptionByValue = (value: string): TimeOption | undefined => {
    return TIME_OPTIONS.find(option => option.value === value);
};