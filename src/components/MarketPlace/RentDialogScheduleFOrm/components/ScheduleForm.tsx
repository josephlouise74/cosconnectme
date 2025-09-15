"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Info, MapPin, Truck } from "lucide-react"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { CostumeRentalInfo, PartialRentalBookingFormData } from "./type"

interface ScheduleFormProps {
    costumeInfo: CostumeRentalInfo
}

interface DateSelection {
    startDate: Date | null
    endDate: Date | null
}

interface CalendarDay {
    date: Date
    isPast: boolean
    isUnavailable: boolean
    isCurrentMonth: boolean
}

interface MonthData {
    month: number
    year: number
    monthName: string
    days: (CalendarDay | null)[]
}

const ScheduleForm = ({ costumeInfo }: ScheduleFormProps) => {
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

    // Watch the form values using the correct field names from schema
    const watchedStartDate = watch("schedule.start_date")
    const watchedEndDate = watch("schedule.end_date")

    // Generate calendar days for current and next month
    const calendarData = useMemo<MonthData[]>(() => {
        const today = new Date()
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

        return [
            generateMonthData(currentMonth, costumeInfo.unavailableDates || []),
            generateMonthData(nextMonth, costumeInfo.unavailableDates || []),
        ]
    }, [costumeInfo.unavailableDates])

    // Calculate rental info from form values (which are ISO strings)
    const rentalInfo = useMemo(() => {
        if (!watchedStartDate || !watchedEndDate) return null

        try {
            // Parse ISO strings to dates
            const start = new Date(watchedStartDate)
            const end = new Date(watchedEndDate)

            // Ensure dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

            // Set to start of day for accurate calculation
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
    useState(() => {
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
    })

    const handleDateClick = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date < today) return
        if (costumeInfo.unavailableDates?.some((unavailable: Date) => {
            const unavailableDate = new Date(unavailable)
            unavailableDate.setHours(0, 0, 0, 0)
            return date.toDateString() === unavailableDate.toDateString()
        })) return

        if (!dateSelection.startDate || isSelectingEndDate) {
            if (isSelectingEndDate && dateSelection.startDate) {
                // Selecting end date
                const endDate = date > dateSelection.startDate ? date : dateSelection.startDate
                const startDate = date > dateSelection.startDate ? dateSelection.startDate : date

                setDateSelection({ startDate, endDate })

                // Set form values as ISO strings (matching schema)
                setValue("schedule.start_date", startDate.toISOString())
                setValue("schedule.end_date", endDate.toISOString())

                setIsSelectingEndDate(false)
            } else {
                // Selecting start date
                const startDate = date
                setDateSelection({ startDate, endDate: null })

                // Set form values as ISO strings
                setValue("schedule.start_date", startDate.toISOString())
                setValue("schedule.end_date", "")

                setIsSelectingEndDate(true)
            }
        } else {
            // Reset selection
            const startDate = date
            setDateSelection({ startDate, endDate: null })

            // Set form values as ISO strings
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

        const isPast = date < today
        const isUnavailable = costumeInfo.unavailableDates?.some((unavailable: Date) => {
            const unavailableDate = new Date(unavailable)
            unavailableDate.setHours(0, 0, 0, 0)
            return date.toDateString() === unavailableDate.toDateString()
        }) || false

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
                    </div>
                </AlertDescription>
            </Alert>

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
                        {calendarData.map((monthData, _) => (
                            <div key={monthData.month} className="space-y-4">
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
                                    {monthData.days.map((day, index) => (
                                        <div key={index} className="aspect-square">
                                            {day ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDateClick(day.date)}
                                                    className={getDateClasses(day.date)}
                                                    disabled={day.isPast || day.isUnavailable}
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
                        Special Instructions  (Landmark)
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

// Helper function to generate month data
const generateMonthData = (monthStart: Date, unavailableDates: Date[]): MonthData => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days: (CalendarDay | null)[] = []

    // Generate calendar grid (6 weeks * 7 days = 42 cells)
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

            days.push({
                date: currentDate,
                isPast: currentDate < today,
                isUnavailable,
                isCurrentMonth: true,
            })
        } else {
            days.push(null) // Empty cell for dates not in current month
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
