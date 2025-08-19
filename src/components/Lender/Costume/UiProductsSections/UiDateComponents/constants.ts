import { TimeOption, AvailabilityTemplate } from './types';

// Generate 12-hour format time options with AM/PM, from 8:00 AM to 10:00 PM
export const generateTimeOptions = (): TimeOption[] => {
    const timeOptions: TimeOption[] = [];
    for (let hour = 8; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 22 && minute === 30) continue; // Skip 10:30 PM

            const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
            const period = hour < 12 ? "AM" : "PM";
            const formattedMinute = minute === 0 ? "00" : minute.toString().padStart(2, "0");
            const label = `${formattedHour}:${formattedMinute} ${period}`;

            timeOptions.push({
                value: label, // Use readable format as value
                label
            });
        }
    }
    return timeOptions;
};

export const TIME_OPTIONS = generateTimeOptions();

export const AVAILABILITY_TEMPLATES: AvailabilityTemplate[] = [
    {
        name: "Always Available",
        slots: [{ start: "12:00 AM", end: "11:59 PM" }],
        isAlwaysAvailable: true
    },
    {
        name: "Business Hours",
        slots: [{ start: "9:00 AM", end: "5:00 PM" }]
    },
    {
        name: "Morning Only",
        slots: [{ start: "8:00 AM", end: "12:00 PM" }]
    },
    {
        name: "Afternoon Only",
        slots: [{ start: "1:00 PM", end: "5:00 PM" }]
    },
    {
        name: "Evening Only",
        slots: [{ start: "6:00 PM", end: "10:00 PM" }]
    },
    {
        name: "Full Day",
        slots: [{ start: "8:00 AM", end: "10:00 PM" }]
    },
    {
        name: "Split Schedule",
        slots: [
            { start: "9:00 AM", end: "12:00 PM" },
            { start: "2:00 PM", end: "7:00 PM" }
        ]
    }
];
