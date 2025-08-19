export interface TimeSlot {
    start: string;
    end: string;
}

export interface AvailabilityDate {
    date: string;
    timeSlots: TimeSlot[];
}

export interface AvailabilityTemplate {
    name: string;
    slots: TimeSlot[];
    isAlwaysAvailable?: boolean;
}

export interface TimeOption {
    value: string;
    label: string;
} 