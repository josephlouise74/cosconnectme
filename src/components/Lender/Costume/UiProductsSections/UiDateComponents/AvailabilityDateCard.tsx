import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AVAILABILITY_TEMPLATES } from "@/utils/TimeOption";
import { Plus, Trash2 } from "lucide-react";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { AvailabilityDate } from "./types";

interface AvailabilityDateCardProps {
    dateItem: AvailabilityDate;
    onUpdateTimeSlot: (slotIndex: number, field: 'start' | 'end', value: string) => void;
    onAddTimeSlot: () => void;
    onRemoveTimeSlot: (slotIndex: number) => void;
    onApplyTemplate: (template: string) => void;
    onDeleteDate: () => void;
}

export const AvailabilityDateCard = ({
    dateItem,
    onUpdateTimeSlot,
    onAddTimeSlot,
    onRemoveTimeSlot,
    onApplyTemplate,
    onDeleteDate,
}: AvailabilityDateCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {dateItem.date === "always" ? "Always Available" : new Date(dateItem.date).toLocaleDateString()}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDeleteDate}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {dateItem.timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <TimeSlotSelector
                                slot={slot}
                                onUpdate={(field, value) => onUpdateTimeSlot(index, field, value)}
                                canRemove={dateItem.timeSlots.length > 1}
                                onRemove={() => onRemoveTimeSlot(index)}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddTimeSlot}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Time Slot
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_TEMPLATES.map((template) => (
                        <Button
                            key={template.name}
                            variant="outline"
                            size="sm"
                            onClick={() => onApplyTemplate(template.name)}
                        >
                            {template.name}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}; 