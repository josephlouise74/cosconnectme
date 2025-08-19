import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isBefore } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface SingleDateSelectorProps {
    onDateSelect: (date: Date | undefined) => void;
    isDateSelected: (date: Date) => boolean;
}

export const SingleDateSelector = ({
    onDateSelect,
    isDateSelected
}: SingleDateSelectorProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Add availability date</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    onSelect={onDateSelect}
                    disabled={(date) =>
                        isBefore(date, new Date()) || // Past dates
                        isDateSelected(date)  // Already selected dates
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}; 