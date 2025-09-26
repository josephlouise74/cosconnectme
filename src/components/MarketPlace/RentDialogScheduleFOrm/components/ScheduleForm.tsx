"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Info, MapPin, Truck } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { CostumeRentalInfo, PartialRentalBookingFormData } from "./type"
import { BookedDateRange, useGetBookedDateRanges } from "@/lib/api/rentalApi"

interface ScheduleFormProps {
    costumeInfo: CostumeRentalInfo
    costumeId: string // Add costumeId prop to fetch booked dates
}

interface DateSelection {
    startDate: Date | null
    endDate: Date | null
}

interface CalendarDay {
    date: Date
    isPast: boolean
    isUnavailable: boolean
    isBooked: boolean // New field for booked dates
    isCurrentMonth: boolean
}

interface MonthData {
    month: number
    year: number
    monthName: string
    days: (CalendarDay | null)[]
}

const ScheduleForm = ({ costumeInfo, costumeId }: ScheduleFormProps) => {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<PartialRentalBookingFormData>()

    const [dateSelection, setDateSelection] = useState<DateSelection>({
        startDate: null,
        endDate: null,
    })
    const [isSelectingEndDate, setIsSelectingEndDate] = useState(false)
    console.log(costumeId)
    // Fetch booked dates for this costume
    const { bookedDateRanges, isFetching } = useGetBookedDateRanges(costumeId)
    console.log(bookedDateRanges)
    // Watch the form values
    const watchedStartDate = watch("schedule.start_date")
    const watchedEndDate = watch("schedule.end_date")

    // Helper function to check if a date is within any booked range
    const isDateBooked = (date: Date, bookedRanges: BookedDateRange[]): boolean => {
        const dateStr = date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format

        return bookedRanges.some(range => {
            const startDate = new Date(range.start_date)
            const endDate = new Date(range.end_date)

            // Set hours to avoid timezone issues
            startDate.setHours(0, 0, 0, 0)
            endDate.setHours(23, 59, 59, 999)
            date.setHours(12, 0, 0, 0) // Set to noon to avoid edge cases

            return date >= startDate && date <= endDate
        })
    }

    // Generate calendar days for current and next month
    const calendarData = useMemo<MonthData[]>(() => {
        const today = new Date()
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

        return [
            generateMonthData(currentMonth, costumeInfo.unavailableDates || [], bookedDateRanges),
            generateMonthData(nextMonth, costumeInfo.unavailableDates || [], bookedDateRanges),
        ]
    }, [costumeInfo.unavailableDates, bookedDateRanges])

    // Calculate rental info from form values
    const rentalInfo = useMemo(() => {
        if (!watchedStartDate || !watchedEndDate) return null

        try {
            const start = new Date(watchedStartDate)
            const end = new Date(watchedEndDate)

            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

            start.setHours(0, 0, 0, 0)
            end.setHours(0, 0, 0, 0)

            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
            const subtotal = Math.max(1, days) * (costumeInfo.dailyRate || 0)
            const securityDeposit = costumeInfo.securityDeposit || 0

            return {
                days,
                subtotal,
                total: subtotal + securityDeposit,
            }
        } catch (error) {
            console.error("Error calculating rental info:", error)
            return null
        }
    }, [watchedStartDate, watchedEndDate, costumeInfo.dailyRate, costumeInfo.securityDeposit])

    // Sync local state with form values on load
    useEffect(() => {
        if (watchedStartDate) {
            const startDate = new Date(watchedStartDate)
            if (!isNaN(startDate.getTime())) {
                setDateSelection(prev => ({ ...prev, startDate }))
            }
        }
        if (watchedEndDate) {
            const endDate = new Date(watchedEndDate)
            if (!isNaN(endDate.getTime())) {
                setDateSelection(prev => ({ ...prev, endDate }))
            }
        }
    }, [watchedStartDate, watchedEndDate])

    const handleDateClick = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Prevent selection of past dates
        if (date < today) return

        // Prevent selection of unavailable dates from costume info
        if (costumeInfo.unavailableDates?.some((unavailable: Date) => {
            const unavailableDate = new Date(unavailable)
            unavailableDate.setHours(0, 0, 0, 0)
            return date.toDateString() === unavailableDate.toDateString()
        })) return

        // Prevent selection of booked dates
        if (isDateBooked(date, bookedDateRanges)) return

        if (!dateSelection.startDate || isSelectingEndDate) {
            if (isSelectingEndDate && dateSelection.startDate) {
                // Selecting end date
                const endDate = date > dateSelection.startDate ? date : dateSelection.startDate
                const startDate = date > dateSelection.startDate ? dateSelection.startDate : date

                setDateSelection({ startDate, endDate })
                setValue("schedule.start_date", startDate.toISOString())
                setValue("schedule.end_date", endDate.toISOString())
                setIsSelectingEndDate(false)
            } else {
                // Selecting start date
                const startDate = date
                setDateSelection({ startDate, endDate: null })
                setValue("schedule.start_date", startDate.toISOString())
                setValue("schedule.end_date", "")
                setIsSelectingEndDate(true)
            }
        } else {
            // Reset selection
            const startDate = date
            setDateSelection({ startDate, endDate: null })
            setValue("schedule.start_date", startDate.toISOString())
            setValue("schedule.end_date", "")
            setIsSelectingEndDate(true)
        }
    }

    const getDateClasses = (date: Date) => {
        const baseClasses =
            "w-full h-10 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:bg-rose-50"
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const isToday = date.toDateString() === today.toDateString()
        const isPast = date < today
        const isUnavailable = costumeInfo.unavailableDates?.some((unavailable: Date) => {
            const unavailableDate = new Date(unavailable)
            unavailableDate.setHours(0, 0, 0, 0)
            return date.toDateString() === unavailableDate.toDateString()
        }) || false
        const isBooked = isDateBooked(date, bookedDateRanges)

        const isSelected =
            (dateSelection.startDate && date.toDateString() === dateSelection.startDate.toDateString()) ||
            (dateSelection.endDate && date.toDateString() === dateSelection.endDate.toDateString())

        const isInRange =
            dateSelection.startDate &&
            dateSelection.endDate &&
            date >= dateSelection.startDate &&
            date <= dateSelection.endDate

        if (isPast || isUnavailable) {
            return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
        }
        if (isBooked) {
            return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed line-through`
        }
        if (isSelected) {
            return `${baseClasses} bg-rose-500 text-white hover:bg-rose-600`
        }
        if (isInRange) {
            return `${baseClasses} bg-rose-100 text-rose-800 hover:bg-rose-200`
        }
        return `${baseClasses} hover:bg-rose-50 text-gray-700`
    }

    const clearDateSelection = () => {
        setDateSelection({ startDate: null, endDate: null })
        setValue("schedule.start_date", "")
        setValue("schedule.end_date", "")
        setIsSelectingEndDate(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Select Rental Dates</h2>
                <p className="text-gray-600">Choose your rental period and delivery address</p>
            </div>

            {/* Rental Info Alert */}
            <Alert className="border-rose-200 bg-rose-50">
                <Info className="h-4 w-4 text-rose-600" />
                <AlertDescription className="text-rose-800">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span>Min: {costumeInfo.minRentalDays} days</span>
                        <span>Max: {costumeInfo.maxRentalDays} days</span>
                        <span>Daily rate: ₱{costumeInfo.dailyRate}</span>
                        <span className="font-semibold text-rose-700">Delivery Only</span>
                        {isFetching && <span className="text-blue-600">Loading booked dates...</span>}
                    </div>
                </AlertDescription>
            </Alert>

            {/* Legend for date colors */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded border"></div>
                    <span>Past/Unavailable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded border"></div>
                    <span>Already Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-500 rounded border"></div>
                    <span>Selected</span>
                </div>
            </div>

            {/* Custom Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-rose-500" />
                        Select Dates
                    </CardTitle>
                    <CardDescription>
                        {!dateSelection.startDate && "Click to select start date"}
                        {dateSelection.startDate && !dateSelection.endDate && "Now select end date"}
                        {dateSelection.startDate && dateSelection.endDate && "Date range selected"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {calendarData.map((monthData, index) => (
                            <div key={`${monthData.month}-${monthData.year}`} className="space-y-4">
                                <h3 className="text-lg font-semibold text-center">
                                    {monthData.monthName} {monthData.year}
                                </h3>

                                {/* Days of week header */}
                                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <div key={day} className="py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {monthData.days.map((day, dayIndex) => (
                                        <div key={dayIndex} className="aspect-square">
                                            {day ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDateClick(day.date)}
                                                    className={getDateClasses(day.date)}
                                                    disabled={day.isPast || day.isUnavailable || day.isBooked}
                                                    title={
                                                        day.isBooked
                                                            ? "This date is already booked"
                                                            : day.isPast
                                                                ? "Past date"
                                                                : day.isUnavailable
                                                                    ? "Unavailable"
                                                                    : ""
                                                    }
                                                >
                                                    {day.date.getDate()}
                                                </button>
                                            ) : (
                                                <div className="w-full h-10" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Selected dates summary */}
                    {(dateSelection.startDate || dateSelection.endDate) && (
                        <div className="mt-6 p-4 bg-rose-50 rounded-lg">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-rose-800">Selected Dates:</div>
                                    <div className="flex gap-2 text-sm">
                                        {dateSelection.startDate && (
                                            <Badge variant="secondary" className="bg-rose-100 text-rose-800">
                                                Start: {dateSelection.startDate.toLocaleDateString()}
                                            </Badge>
                                        )}
                                        {dateSelection.endDate && (
                                            <Badge variant="secondary" className="bg-rose-100 text-rose-800">
                                                End: {dateSelection.endDate.toLocaleDateString()}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {rentalInfo && (
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-rose-800">
                                            {rentalInfo.days} day{rentalInfo.days !== 1 ? "s" : ""}
                                        </div>
                                        <div className="text-sm text-rose-600">
                                            ₱{rentalInfo.subtotal} + ₱{costumeInfo.securityDeposit} deposit
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearDateSelection}
                                className="mt-3 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}

                    {/* Form validation errors */}
                    {errors.schedule?.start_date && (
                        <p className="text-sm text-red-600 mt-2">
                            {errors.schedule.start_date.message}
                        </p>
                    )}
                    {errors.schedule?.end_date && (
                        <p className="text-sm text-red-600 mt-2">
                            {errors.schedule.end_date.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-rose-500" />
                        Delivery Address
                    </CardTitle>
                    <CardDescription>Where should we deliver your costume?</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={control}
                        name="schedule.delivery_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Complete Address</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter your complete delivery address (street, barangay, city, province)"
                                        className="min-h-[80px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-rose-500" />
                        Special Instructions (Landmark)
                    </CardTitle>
                    <CardDescription>Any special requests or notes for your rental? (Optional)</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={control}
                        name="schedule.special_instructions"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., Preferred delivery time, fitting concerns, event details, special handling requests..."
                                        className="min-h-[100px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Rental Summary */}
            {rentalInfo && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardHeader>
                        <CardTitle className="text-rose-800 flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Rental Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>
                                    Rental ({rentalInfo.days} day{rentalInfo.days !== 1 ? "s" : ""})
                                </span>
                                <span>₱{rentalInfo.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Security Deposit</span>
                                <span>₱{costumeInfo.securityDeposit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery</span>
                                <span className="text-green-600 font-medium">Included</span>
                            </div>
                            <hr className="border-rose-200" />
                            <div className="flex justify-between font-semibold text-rose-800">
                                <span>Total</span>
                                <span>₱{rentalInfo.total}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Helper function to generate month data with booked dates
const generateMonthData = (
    monthStart: Date,
    unavailableDates: Date[],
    bookedDateRanges: BookedDateRange[]
): MonthData => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: (CalendarDay | null)[] = []

    // Helper function to check if date is booked
    const isDateBookedHelper = (date: Date): boolean => {
        const dateStr = date.toISOString().split('T')[0]

        return bookedDateRanges.some(range => {
            const startDate = new Date(range.start_date)
            const endDate = new Date(range.end_date)

            startDate.setHours(0, 0, 0, 0)
            endDate.setHours(23, 59, 59, 999)
            date.setHours(12, 0, 0, 0)

            return date >= startDate && date <= endDate
        })
    }

    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        currentDate.setHours(0, 0, 0, 0)

        if (currentDate.getMonth() === month) {
            const isUnavailable = unavailableDates.some(unavailable => {
                const unavailableDate = new Date(unavailable)
                unavailableDate.setHours(0, 0, 0, 0)
                return currentDate.toDateString() === unavailableDate.toDateString()
            })

            const isBooked = isDateBookedHelper(currentDate)

            days.push({
                date: currentDate,
                isPast: currentDate < today,
                isUnavailable,
                isBooked,
                isCurrentMonth: true,
            })
        } else {
            days.push(null)
        }
    }

    return {
        month,
        year,
        monthName: firstDay.toLocaleString("default", { month: "long" }),
        days,
    }
}

export { ScheduleForm }