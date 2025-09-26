"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetMarketCostumeById } from "@/lib/api/marketplaceApi"

import { RentalBookingDialog } from "@/components/MarketPlace/RentDialogScheduleFOrm/RentDialogScheduleForm"
import type { CostumeByName } from "@/lib/types/marketplace/get-costume"
import {
    ChevronLeft,
    ChevronRight,
    Mail,
    MapPin,
    Phone,
    Shield,
    Shirt,
    Tag,
    User,
    Calendar,
    CalendarX,
    Eye,
    Heart,
    Clock
} from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import type React from "react"
import { useMemo, useState } from "react"

interface CostumeDetailViewerProps {
    costumeId?: any
}

const CostumeDetailViewer: React.FC<CostumeDetailViewerProps> = ({ costumeId }) => {
    const params = useParams()

    const id = useMemo(() => {
        if (costumeId) {
            return costumeId
        }

        const paramId = params?.costume_id
        if (typeof paramId === "string") {
            return paramId
        }

        return ""
    }, [costumeId, params?.costume_id])

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const { costume, isLoading, isError, error } = useGetMarketCostumeById(id)

    if (!id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Invalid Costume ID</AlertTitle>
                    <AlertDescription>Please provide a valid costume ID to view details.</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (isLoading) {
        return <CostumeDetailSkeleton />
    }

    if (isError || !costume) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Costume Not Found</AlertTitle>
                    <AlertDescription>{error?.message || `The costume with ID ${id} could not be found.`}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                <CostumeImageGallery
                    costume={costume}
                    selectedIndex={selectedImageIndex}
                    onImageSelect={setSelectedImageIndex}
                />
                <CostumeInformation costume={costume} />
            </div>
            <LenderInformation costume={costume} />
        </div>
    )
}

const CostumeImageGallery: React.FC<{
    costume: CostumeByName
    selectedIndex: number
    onImageSelect: (index: number) => void
}> = ({ costume, selectedIndex, onImageSelect }) => {
    const allImages = useMemo(() => {
        const images = []
        if (costume.main_images?.front) images.push(costume.main_images.front)
        if (costume.main_images?.back) images.push(costume.main_images.back)
        if (costume.additional_images?.length) {
            costume.additional_images.forEach((img) => {
                if (typeof img === 'string') {
                    images.push(img)
                } else if (img?.url) {
                    images.push(img.url)
                }
            })
        }
        return images.filter(Boolean)
    }, [costume.main_images, costume.additional_images])

    const nextImage = () => {
        onImageSelect((selectedIndex + 1) % allImages.length)
    }

    const prevImage = () => {
        onImageSelect(selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1)
    }

    if (allImages.length === 0) {
        return (
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Shirt className="h-16 w-16 mx-auto mb-2" />
                    <p>No images available</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 group">
                <Image
                    src={allImages[selectedIndex] || "/placeholder.svg?height=600&width=600"}
                    alt={`${costume.name} - Image ${selectedIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                />

                {allImages.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                            onClick={prevImage}
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                            onClick={nextImage}
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}

                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {selectedIndex + 1} / {allImages.length}
                </div>
            </div>

            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => onImageSelect(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === index
                                ? "border-rose-500 ring-2 ring-rose-500/20"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={image || "/placeholder.svg?height=80&width=80"}
                                alt={`${costume.name} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const BookedDatesDisplay: React.FC<{ bookedDates: string[] }> = ({ bookedDates }) => {
    const [showAll, setShowAll] = useState(false)

    if (!bookedDates || bookedDates.length === 0) {
        return null
    }

    const sortedDates = bookedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    const displayDates = showAll ? sortedDates : sortedDates.slice(0, 5)

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <CalendarX className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-gray-900">Already Booked Dates</h4>
                <Badge variant="outline" className="text-red-600 border-red-200">
                    {bookedDates.length} {bookedDates.length === 1 ? 'date' : 'dates'}
                </Badge>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    {displayDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-1 text-red-700">
                            <Calendar className="h-3 w-3" />
                            {formatDate(date)}
                        </div>
                    ))}
                </div>
                {bookedDates.length > 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-1 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : `Show ${bookedDates.length - 5} More Dates`}
                    </Button>
                )}
                <p className="text-xs text-red-600 mt-2">
                    These dates are not available for booking.
                </p>
            </div>
        </div>
    )
}

const CostumeInformation: React.FC<{ costume: CostumeByName }> = ({ costume }) => {
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header with badges */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize bg-rose-100 text-rose-800">
                        {costume.listing_type}
                    </Badge>
                    <Badge variant="outline" className="border-rose-200 text-rose-700">
                        {costume.category}
                    </Badge>
                    {!costume.is_available && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Unavailable
                        </Badge>
                    )}
                    <Badge variant="outline" className="border-gray-200 text-gray-600">
                        {costume.status}
                    </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{costume.name}</h1>
                {costume.brand && <p className="text-lg text-gray-600">{costume.brand}</p>}

                {/* View and favorite count */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{costume.view_count} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{costume.favorite_count} favorites</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Listed {formatDate(costume.created_at)}</span>
                    </div>
                </div>
            </div>

            {/* Pricing Card */}
            <Card className="border-rose-200">
                <CardContent className="pt-6">
                    {costume.listing_type === "rent" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-start gap-2">
                                <span className="text-2xl font-bold text-rose-600">₱{costume.rental_price}</span>
                                <span className="text-sm text-gray-500">per day</span>
                            </div>

                            {costume.security_deposit && costume.security_deposit !== "0" && (
                                <div className="flex items-center gap-2 text-amber-600">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm">Security Deposit: ₱{costume.security_deposit}</span>
                                </div>
                            )}

                            {costume.extended_days_price && costume.extended_days_price !== "0" && (
                                <div className="text-sm text-gray-600">
                                    Extended days: ₱{costume.extended_days_price}/day
                                </div>
                            )}
                        </div>
                    )}

                    {costume.listing_type === "sell" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-start gap-2">
                                <span className="text-2xl font-bold text-rose-600">₱{costume.sale_price}</span>
                                {costume.discount_percentage > 0 && (
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        {costume.discount_percentage}% off
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Costume Details */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {costume.sizes && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Shirt className="h-4 w-4" />
                            <span className="text-sm">Size: {costume.sizes}</span>
                        </div>
                    )}
                    {costume.gender && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="text-sm capitalize">Gender: {costume.gender}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Booked Dates Display */}
            {costume.listing_type === "rent" && (
                <BookedDatesDisplay bookedDates={costume.booked_dates} />
            )}

            {/* Description */}
            {costume.description && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{costume.description}</p>
                </div>
            )}

            {/* Tags */}
            {costume.tags?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {costume.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Add-ons (if any) */}
            {costume.add_ons?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Add-ons Available</h3>
                    <div className="space-y-2">
                        {costume.add_ons.map((addon, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-sm text-gray-700">{JSON.stringify(addon)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {costume.listing_type === "rent" ? (
                    <>
                        <Button
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                            size="lg"
                            onClick={() => setIsBookingDialogOpen(true)}
                            disabled={!costume.is_available}
                        >
                            {costume.is_available ? "Book Now" : "Currently Unavailable"}
                        </Button>

                        <RentalBookingDialog
                            isOpen={isBookingDialogOpen}
                            onClose={() => setIsBookingDialogOpen(false)}
                            costumeInfo={{
                                id: costume.id,
                                name: costume.name,
                                price: Number(costume.rental_price) || 0,
                                brand: costume.brand || '',
                                category: costume.category || '',
                                size: costume.sizes || '',
                                dailyRate: Number(costume.rental_price) || 0,
                                securityDeposit: Number(costume.security_deposit) || 0,
                                images: {
                                    main: {
                                        front: costume.main_images?.front || '',
                                        back: costume.main_images?.back || ''
                                    },
                                    additional: costume.additional_images?.map(img => ({
                                        url: typeof img === 'string' ? img : img?.url || '',
                                        alt_text: ''
                                    })) || []
                                },
                                unavailableDates: costume.booked_dates || [],
                                minRentalDays: 1,
                                maxRentalDays: 30
                            }}
                            onBookingComplete={(data) => {
                                console.log('Booking completed:', data);
                            }}
                        />
                        <Button
                            variant="outline"
                            className="flex-1 border-rose-500 text-rose-500 hover:bg-rose-50"
                            size="lg"
                        >
                            Message Lender
                        </Button>
                    </>
                ) : (
                    <Button
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                        size="lg"
                        disabled={!costume.is_available}
                    >
                        {costume.is_available ? "Buy Now" : "Currently Unavailable"}
                    </Button>
                )}
            </div>
        </div>
    )
}

const LenderInformation: React.FC<{ costume: CostumeByName }> = ({ costume }) => {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                    <User className="h-5 w-5" />
                    Lender Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {costume.business_profile_image || costume.user_profile_image ? (
                            <Image
                                src={costume.business_profile_image || costume.user_profile_image}
                                alt={costume.business_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-rose-100">
                                <User className="h-8 w-8 text-rose-600" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold">{costume.business_name}</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize border-rose-200 text-rose-700">
                                {costume.business_type?.toLowerCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-600">
                                @{costume.user_name}
                            </Badge>
                        </div>
                        {costume.business_description && (
                            <p className="text-gray-600 text-sm">{costume.business_description}</p>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Contact Information</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{costume.business_email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{costume.business_phone}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                Personal: {costume.user_email}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Location</h4>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <div>{costume.address_street}, {costume.address_barangay}</div>
                                <div>{costume.address_city?.name}, {costume.address_province}</div>
                                <div>{costume.address_region} {costume.address_zip_code}</div>
                                <div>{costume.address_country}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const CostumeDetailSkeleton: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <Skeleton className="aspect-[3/4] rounded-xl" />
                    <div className="flex gap-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-32 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 flex-1" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default CostumeDetailViewer