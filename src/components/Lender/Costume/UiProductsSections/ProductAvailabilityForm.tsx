import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { addDays, format, isAfter, parseISO, startOfDay } from "date-fns";
import { Calendar, CalendarRange, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useFormContext } from "react-hook-form";
import { AvailabilityDate } from "./UiDateComponents/types";

interface ProductAvailabilityFormProps {
  product?: {
    availabilityDates?: AvailabilityDate[];
  } | undefined;
}

interface TimeSlot {
  start: string;
  end: string;
}

// Time options for the time picker
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const ProductAvailabilityForm: React.FC<ProductAvailabilityFormProps> = ({ product }) => {
  const { watch, setValue } = useFormContext();
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("single");

  // Time range state
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  // Initialize with product's availability dates if they exist
  const availabilityDates = watch("availabilityDates") || product?.availabilityDates || [];

  // Handle always available toggle
  const handleAlwaysAvailableToggle = useCallback((checked: boolean) => {
    setIsAlwaysAvailable(checked);
    if (checked) {
      setValue("availabilityDates", [{
        date: "always",
        timeSlots: [{ start: "00:00", end: "23:59" }]
      }]);
    } else {
      setValue("availabilityDates", []);
    }
  }, [setValue]);

  // Handle single date selection
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date || isAlwaysAvailable) return;
    setSelectedDate(date);
  }, [isAlwaysAvailable]);

  // Handle date range selection
  const handleDateRangeSelect = useCallback((range: DateRange | undefined) => {
    if (!range || isAlwaysAvailable) return;
    setDateRange(range);
  }, [isAlwaysAvailable]);

  // Add selected date and time range
  const handleAddAvailability = useCallback(() => {
    if (isAlwaysAvailable) return;

    if (activeTab === "single" && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const timeSlots = [{
        start: startTime,
        end: endTime
      }];

      // Check for overlapping dates
      const existingDate = availabilityDates.find((item: AvailabilityDate) => item.date === dateStr);
      if (existingDate) {
        // Merge time slots if date already exists
        const mergedTimeSlots = [...existingDate.timeSlots, ...timeSlots]
          .sort((a, b) => a.start.localeCompare(b.start));

        setValue("availabilityDates", [
          ...availabilityDates.filter((item: AvailabilityDate) => item.date !== dateStr),
          {
            date: dateStr,
            timeSlots: mergedTimeSlots
          }
        ]);
      } else {
        setValue("availabilityDates", [
          ...availabilityDates,
          {
            date: dateStr,
            timeSlots
          }
        ]);
      }

      setSelectedDate(undefined);
    } else if (activeTab === "range" && dateRange?.from && dateRange?.to) {
      const newDates: AvailabilityDate[] = [];
      let currentDate = startOfDay(dateRange.from);

      const timeSlots = [{
        start: startTime,
        end: endTime
      }];

      while (!isAfter(currentDate, dateRange.to)) {
        const dateStr = format(currentDate, "yyyy-MM-dd");

        // Check if date already exists
        const existingDate = availabilityDates.find((item: AvailabilityDate) => item.date === dateStr);
        if (existingDate) {
          // Merge time slots
          const mergedTimeSlots = [...existingDate.timeSlots, ...timeSlots]
            .sort((a, b) => a.start.localeCompare(b.start));

          newDates.push({
            date: dateStr,
            timeSlots: mergedTimeSlots
          });
        } else {
          newDates.push({
            date: dateStr,
            timeSlots
          });
        }

        currentDate = addDays(currentDate, 1);
      }

      setValue("availabilityDates", [
        ...availabilityDates.filter((item: AvailabilityDate) =>
          !newDates.some(newDate => newDate.date === item.date)
        ),
        ...newDates
      ]);

      setDateRange(undefined);
    }
  }, [selectedDate, dateRange, availabilityDates, setValue, isAlwaysAvailable, activeTab, startTime, endTime]);

  // Remove availability date
  const handleRemoveDate = useCallback((dateToRemove: string) => {
    setValue(
      "availabilityDates",
      availabilityDates.filter((item: AvailabilityDate) => item.date !== dateToRemove)
    );
  }, [availabilityDates, setValue]);

  // Sort dates chronologically
  const sortedAvailabilityDates = useMemo(() => {
    return [...availabilityDates]
      .filter((item: AvailabilityDate) => item.date !== "always")
      .sort((a: AvailabilityDate, b: AvailabilityDate) => a.date.localeCompare(b.date));
  }, [availabilityDates]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Availability</CardTitle>
        <CardDescription>
          Set when this product will be available for rent (Philippine Time, UTC+8)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="always-available"
            checked={isAlwaysAvailable}
            onCheckedChange={handleAlwaysAvailableToggle}
          />
          <Label htmlFor="always-available">Always Available (24/7)</Label>
        </div>

        {!isAlwaysAvailable && (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Date</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>

              <TabsContent value="range" className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                          : "Pick a date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Set Time Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAddAvailability}
              disabled={
                activeTab === "single"
                  ? !selectedDate
                  : !dateRange?.from || !dateRange?.to
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Availability
            </Button>

            {sortedAvailabilityDates.length > 0 && (
              <div className="space-y-4">
                <Label>Current Availability</Label>
                <ScrollArea className="h-60 rounded-md border p-4">
                  <div className="space-y-4">
                    {sortedAvailabilityDates.map((dateItem) => (
                      <div
                        key={dateItem.date}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(parseISO(dateItem.date), "PPP")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dateItem.timeSlots.map((slot: TimeSlot, index: number) => (
                              <span key={index} className="inline-block mr-2">
                                {slot.start} - {slot.end}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDate(dateItem.date)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {availabilityDates.length > 0 && (
        <CardContent>
          <Alert>
            <AlertDescription className="text-sm">
              {isAlwaysAvailable
                ? "This product is available 24/7 for rent."
                : `You've set availability for ${availabilityDates.length} ${availabilityDates.length === 1 ? "day" : "days"}.`}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};

export default ProductAvailabilityForm;