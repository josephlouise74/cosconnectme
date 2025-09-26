import { BookedDateRange } from "@/lib/api/rentalApi"

interface CalendarDay {
    date: Date
    isPast: boolean
    isUnavailable: boolean
    isBooked: boolean
    isCurrentMonth: boolean
}

export interface MonthData {
    month: number
    year: number
    monthName: string
    days: (CalendarDay | null)[]
}

/**
 * Helper function to check if a date is within any booked range
 */
const isDateBookedHelper = (date: Date, bookedDateRanges: BookedDateRange[]): boolean => {
    return bookedDateRanges.some(range => {
        const startDate = new Date(range.start_date)
        const endDate = new Date(range.end_date)

        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        date.setHours(12, 0, 0, 0)

        return date >= startDate && date <= endDate
    })
}

/**
 * Generates calendar month data with availability information
 */
export const generateMonthData = (
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

            const isBooked = isDateBookedHelper(currentDate, bookedDateRanges)

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
