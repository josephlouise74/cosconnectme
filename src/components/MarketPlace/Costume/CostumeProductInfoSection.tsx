"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetMarketCostumeById } from "@/lib/api/marketplaceApi"

import type { CostumeByName } from "@/lib/types/marketplace/get-costume"
import { Eye, Heart, MapPin, Phone, Mail, Shield, ChevronLeft, ChevronRight, Shirt, Tag, User } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import type React from "react"
import { useState, useMemo } from "react"
import { RentalBookingDialog } from "@/components/MarketPlace/RentDialogScheduleFOrm/RentDialogScheduleForm"

interface CostumeDetailViewerProps {
    costumeId?: number
}

const CostumeDetailViewer: React.FC<CostumeDetailViewerProps> = ({ costumeId }) => {
    const params = useParams()

    console.log("[v0] URL params:", params)
    console.log("[v0] Raw costume_id from params:", params?.costume_id)
    console.log("[v0] Prop costumeId:", costumeId)

    const id = useMemo(() => {
        if (costumeId) {
            console.log("[v0] Using prop costumeId:", costumeId)
            return costumeId
        }

        const paramId = params?.costume_id
        console.log("[v0] Extracted paramId:", paramId)

        if (typeof paramId === "string") {
            const parsedId = Number.parseInt(paramId, 10)
            console.log("[v0] Parsed ID:", parsedId, "isNaN:", isNaN(parsedId))
            return isNaN(parsedId) ? 0 : parsedId
        }

        console.log("[v0] No valid ID found, returning 0")
        return 0
    }, [costumeId, params?.costume_id])

    console.log("[v0] Final costume ID being used:", id)

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const { costume, isLoading, isError, error } = useGetMarketCostumeById(id.toString())

    console.log(
        "[v0] API response - isLoading:",
        isLoading,
        "isError:",
        isError,
        "costume:",
        costume ? "found" : "not found",
    )

    if (id === 0) {
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
            <LenderInformation lender={costume.lender} />
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
        if (costume.images?.main?.front) images.push(costume.images.main.front)
        if (costume.images?.main?.back) images.push(costume.images.main.back)
        if (costume.images?.additional?.length) {
            costume.images.additional.map((img) => images.push(img.url))
        }
        return images.filter(Boolean)
    }, [costume.images])

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

const CostumeInformation: React.FC<{ costume: CostumeByName }> = ({ costume }) => {
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize bg-rose-100 text-rose-800">
                        {costume.listing_type}
                    </Badge>
                    <Badge variant="outline" className="border-rose-200 text-rose-700">
                        {costume.category}
                    </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{costume.name}</h1>
                {costume.brand && <p className="text-lg text-gray-600">{costume.brand}</p>}
            </div>

            <Card className="border-rose-200">
                <CardContent className="pt-6">
                    {costume.pricing?.rental && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-start gap-2">
                                <span className="text-2xl font-bold text-rose-600">₱{costume.pricing.rental.price}</span>
                                <span className="text-sm text-gray-500">per day</span>
                            </div>

                            {costume.pricing.rental.security_deposit && (
                                <div className="flex items-center gap-2 text-amber-600">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm">Security Deposit: ₱{costume.pricing.rental.security_deposit}</span>
                                </div>
                            )}

                            {costume.pricing.rental.extended_days_price && (
                                <div className="text-sm text-gray-600">
                                    Extended days: ₱{costume.pricing.rental.extended_days_price}/day
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

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

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{costume.view_count || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{costume.favorite_count || 0} favorites</span>
                    </div>
                </div>
            </div>

            {costume.description && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{costume.description}</p>
                </div>
            )}

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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {costume.listing_type === "rent" ? (
                    <>
                        <Button
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                            size="lg"
                            onClick={() => setIsBookingDialogOpen(true)}
                        >
                            Rent Now
                        </Button>
                        <RentalBookingDialog
                            isOpen={isBookingDialogOpen}
                            onClose={() => setIsBookingDialogOpen(false)}
                            costumeInfo={{
                                id: costume.id.toString(),
                                name: costume.name,
                                brand: costume.brand || '',
                                category: costume.category || '',
                                size: costume.sizes || '',
                                dailyRate: Number(costume.pricing?.rental?.price) || 0,
                                securityDeposit: Number(costume.pricing?.rental?.security_deposit) || 0,
                                images: {
                                    main: {
                                        front: costume.images?.main?.front || '',
                                        back: costume.images?.main?.back || ''
                                    },
                                    additional: costume.images?.additional?.map(img => ({
                                        url: img.url,
                                        alt_text: ''
                                    })) || []
                                },
                                unavailableDates: [],
                                minRentalDays: 1,
                                maxRentalDays: 30
                            }}
                            onBookingComplete={(data) => {
                                console.log('Booking completed:', data);
                                // Handle successful booking (e.g., show success message, redirect, etc.)
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
                    <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white" size="lg">
                        Buy Now
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="lg"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 bg-transparent"
                    aria-label="Add to favorites"
                >
                    <Heart className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

const LenderInformation: React.FC<{ lender: CostumeByName["lender"] }> = ({ lender }) => {
    return (
        <Card className="mt-8 ">
            <CardHeader className="">
                <CardTitle className="flex items-center gap-2 text-black">
                    <User className="h-5 w-5" />
                    Lender Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {lender.images.profile ? (
                            <Image
                                src={lender.images.profile || "/placeholder.svg"}
                                alt={lender.business_name}
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
                        <h3 className="text-xl font-semibold">{lender.business_name}</h3>
                        <Badge variant="outline" className="capitalize border-rose-200 text-rose-700">
                            {lender.business_type.toLowerCase()}
                        </Badge>
                        <p className="text-gray-600 text-sm">{lender.business_description}</p>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Contact</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{lender.contact.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{lender.contact.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Location</h4>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <div>
                                    {lender.address.street}, {lender.address.barangay}
                                </div>
                                <div>
                                    {lender.address.city.name}, {lender.address.province}
                                </div>
                                <div>
                                    {lender.address.region} {lender.address.zip_code}
                                </div>
                                <div>{lender.address.country}</div>
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
                    <Skeleton className="aspect-square rounded-xl" />
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
                    </div>
                    <Skeleton className="h-32 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default CostumeDetailViewer
