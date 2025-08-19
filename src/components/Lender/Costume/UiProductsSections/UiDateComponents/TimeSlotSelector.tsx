import { Clock, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TIME_OPTIONS } from "@/utils/TimeOption";
import { useState } from "react";
import { TimeSlot } from "./types";

interface TimeSlotSelectorProps {
    slot: TimeSlot;
    onUpdate: (field: 'start' | 'end', value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const TimeSlotSelector = ({
    slot,
    onUpdate,
    onRemove,
    canRemove
}: TimeSlotSelectorProps) => {
    const [selectedStart, setSelectedStart] = useState(slot.start);
    const [selectedEnd, setSelectedEnd] = useState(slot.end);

    const handleStartChange = (newValue: string) => {
        setSelectedStart(newValue);
        onUpdate('start', newValue);
    };

    const handleEndChange = (newValue: string) => {
        setSelectedEnd(newValue);
        onUpdate('end', newValue);
    };

    return (
        <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-md">
            <div className="flex items-center gap-2 flex-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select
                    value={selectedStart}
                    onValueChange={handleStartChange}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                        {TIME_OPTIONS.map(time => (
                            <SelectItem key={`start-${time.value}`} value={time.value}>
                                {time.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span>to</span>

                <Select
                    value={selectedEnd}
                    onValueChange={handleEndChange}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                        {TIME_OPTIONS.filter(time => time.value > selectedStart).map(time => (
                            <SelectItem key={`end-${time.value}`} value={time.value}>
                                {time.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                disabled={!canRemove}
                className="h-8 w-8 text-rose-500 hover:text-rose-600"
                aria-label="Remove time slot"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}; 