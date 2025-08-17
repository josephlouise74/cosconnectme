"use client"
// SellerInfo.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
    Building2,
    CalendarDays,
    Mail,
    MapPin,
    Phone,
    Shield,
    ShieldCheck,
    User
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import Image from 'next/image';
import { useGetLenderById } from '@/lib/api/marketplaceApi';
import { LenderByIdResponse } from '@/lib/types/lenderType';

interface SellerInfoProps {
    lenderId: string;
}

export const SellerInfo = React.memo(({ lenderId }: SellerInfoProps) => {
    const { data: lender, isLoading, isError } = useGetLenderById(lenderId) as { data: LenderByIdResponse['data'] | undefined, isLoading: boolean, isError: boolean };
    console.log("dd", lender)
    const [imgError, setImgError] = useState(false);

    if (isLoading) {
        return (
            <Card className="w-full h-96">
                <CardContent className="flex justify-center items-center h-full">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
                        <span className="text-sm text-muted-foreground">Loading seller info...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError || !lender) {
        return (
            <Card className="w-full h-96">
                <CardContent className="flex justify-center items-center h-full">
                    <div className="text-center text-red-500">
                        <Shield className="h-8 w-8 mx-auto mb-2" />
                        <span>Unable to load seller info</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const business = lender.business_info;
    const isVerified = lender.status === 'verified';

    // Generate initials for avatar fallback
    const getInitials = () => {
        if (business?.business_name) {
            return business.business_name
                .split(' ')
                .map((word: string) => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return lender.username.charAt(0).toUpperCase();
    };

    // Format address
    const getFullAddress = () => {
        const addressParts = [
            business?.street,
            business?.barangay,
            business?.city?.name,
            business?.province,
            business?.region
        ].filter(Boolean);
        return addressParts.length > 0 ? addressParts.join(', ') : business?.business_address;
    };

    // Format join date
    const formatJoinDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    console.log("lener", lender.profile_image)

    return (
        <Card className="w-full shadow-sm border-0 ring-1 ring-border">
            <CardHeader className="text-center pb-4">
                {/* Avatar */}
                <div className="flex justify-center">
                    <div className="relative h-20 w-20 ring-2 ring-rose-100 rounded-full overflow-hidden flex items-center justify-center bg-rose-50">
                        {!imgError && (
                            <Image
                                src={lender.profile_image || '/images/default-avatar.jpg'}
                                alt={business?.business_name || lender.username}
                                fill
                                className="object-cover rounded-full"
                                sizes="80px"
                                priority
                                onError={() => setImgError(true)}
                            />
                        )}
                        {(imgError || !lender.profile_image) && (
                            <span className="absolute inset-0 flex items-center justify-center text-rose-600 text-3xl font-semibold select-none">
                                {getInitials()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Business/User Name */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        {business?.business_name || `@${lender.username}`}
                    </h2>

                    {/* Verification Badge */}
                    <Badge
                        variant={isVerified ? 'default' : 'secondary'}
                        className={
                            isVerified
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-muted text-muted-foreground'
                        }
                    >
                        {isVerified ? (
                            <>
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified Seller
                            </>
                        ) : (
                            <>
                                <Shield className="h-3 w-3 mr-1" />
                                Unverified Seller
                            </>
                        )}
                    </Badge>
                </div>

                {/* Business Type */}
                {business?.business_type && (
                    <Badge variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {business.business_type}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Bio/Description */}
                {(business?.business_description || lender.bio) && (
                    <>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {business?.business_description || lender.bio}
                            </p>
                        </div>
                        <Separator />
                    </>
                )}

                {/* Contact Information */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center">
                        <User className="h-4 w-4 mr-2 text-rose-600" />
                        Contact Details
                    </h3>

                    <div className="space-y-2 text-sm">
                        {/* Phone Numbers */}
                        {business?.business_phone_number && (
                            <div className="flex items-center text-muted-foreground">
                                <Phone className="h-4 w-4 mr-2 text-rose-500" />
                                <span>{business.business_phone_number}</span>
                            </div>
                        )}

                        {business?.business_telephone && business.business_telephone !== business?.business_phone_number && (
                            <div className="flex items-center text-muted-foreground">
                                <Phone className="h-4 w-4 mr-2 text-rose-500" />
                                <span>{business.business_telephone}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2 text-rose-500" />
                            <span className="truncate">{lender.email}</span>
                        </div>

                        {/* Address */}
                        {getFullAddress() && (
                            <div className="flex items-start text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-rose-500 flex-shrink-0" />
                                <span className="text-xs leading-relaxed">{getFullAddress()}</span>
                            </div>
                        )}

                        {/* Member Since */}
                        <div className="flex items-center text-muted-foreground">
                            <CalendarDays className="h-4 w-4 mr-2 text-rose-500" />
                            <span>Member since {formatJoinDate(lender.created_at)}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Verification Status */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Verification Status</h3>
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={lender.email_verified ? 'default' : 'outline'}
                            className={`text-xs ${lender.email_verified
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : ''}`}
                        >
                            {lender.email_verified ? '✓' : '✗'} Email
                        </Badge>
                        <Badge
                            variant={lender.phone_verified ? 'default' : 'outline'}
                            className={`text-xs ${lender.phone_verified
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : ''}`}
                        >
                            {lender.phone_verified ? '✓' : '✗'} Phone
                        </Badge>
                    </div>
                </div>

                {/* Action Button */}
                <Link href={`/lender/profile/${lender.username}`} className="w-full curs block">
                    <Button
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                        size="lg"
                    >
                        View Full Profile
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
});