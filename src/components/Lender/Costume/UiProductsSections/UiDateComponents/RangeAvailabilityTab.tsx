import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, isBefore } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { AVAILABILITY_TEMPLATES } from "./constants";

interface RangeAvailabilityTabProps {
    onRangeApply: (startDate: Date, endDate: Date, template: string) => void;
}

export const RangeAvailabilityTab = ({ onRangeApply }: RangeAvailabilityTabProps) => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedTemplate, setSelectedTemplate] = useState(AVAILABILITY_TEMPLATES[0]?.name || "");

    const handleRangeApply = () => {
        if (startDate && endDate) {
            onRangeApply(startDate, endDate, selectedTemplate);
            setStartDate(undefined);
            setEndDate(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal mt-2",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "MMM d, yyyy") : "Select start date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                disabled={(date) => isBefore(date, new Date())} // Past dates
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal mt-2",
                                    !endDate && "text-muted-foreground"
                                )}
                                disabled={!startDate}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "MMM d, yyyy") : "Select end date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                disabled={(date) =>
                                    isBefore(date, new Date()) || // Past dates
                                    (startDate ? isBefore(date, startDate) : false) // Before start date
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div>
                <Label htmlFor="template">Time Schedule Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                        {AVAILABILITY_TEMPLATES.map(template => (
                            <SelectItem key={template.name} value={template.name}>
                                {template.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Preview:</p>
                    <div className="mt-1 p-2 border rounded-md bg-muted/20">
                        {AVAILABILITY_TEMPLATES.find(t => t.name === selectedTemplate)?.slots.map((slot, idx) => (
                            <div key={idx} className="text-sm py-1">
                                {slot.start} - {slot.end}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                disabled={!startDate || !endDate}
                onClick={handleRangeApply}
                className="w-full"
            >
                Apply to Date Range
            </Button>
        </div>
    );
};
