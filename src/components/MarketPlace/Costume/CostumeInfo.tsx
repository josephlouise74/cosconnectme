"use client"
// CostumeInfo.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSwitchRole } from '@/lib/api/authApi';
import { useSendMessageInquire } from '@/lib/api/messageApi';

import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth';
import { CostumeItem } from '@/lib/types/marketplaceType';
import { cn } from '@/lib/utils';
import {
    Heart,
    Loader2,
    MessageCircle,
    Package,
    Plus,
    Tag,
    User
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from "sonner";

interface CostumeInfoProps {
    costume: CostumeItem;
}

const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(amount));
};

const CostumeInfo = React.memo(({ costume }: CostumeInfoProps) => {
    const router = useRouter();
    const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();
    const { sendMessage, isLoading: isSendMessageLoading } = useSendMessageInquire();
    const { mutateAsync: switchRole, isLoading: isSwitchingRole } = useSwitchRole();

    if (!costume) {
        return (
            <Card className="w-full h-96">
                <CardContent className="flex justify-center items-center h-full">
                    <div className="text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2" />
                        <span>No costume information available</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleInquireNow = async () => {
        try {
            if (!isAuthenticated || !userRolesData) {
                router.push('/signin');
                toast.warning("Please login first to inquire");
                return;
            }
            if (userRolesData.current_role !== 'borrower') {
                toast.error("Only borrowers can inquire about costumes");
                return;
            }
            let username: string = userRolesData.username ?? '';
            if (!username || typeof username !== 'string' || username.trim() === '') {
                const email = userRolesData.email;
                username = email ? email.split('@')[0] ?? '' : '';
            }
            if (!username) username = 'user';
            username = username.toLowerCase();
            const prepareDataMessageInquiry = {
                conversationId: `${userRolesData.user_id}_${costume.id}_${costume.lender_user_id}`,
                costumeName: costume.name,
                lenderId: costume.lender_user_id,
                lenderUsername: costume.lender_user_username,
                borrowerId: userRolesData.user_id,
                borrowerUsername: username,
                costumeId: costume.id,
                timestamp: new Date().toISOString(),
            };
            await sendMessage(prepareDataMessageInquiry);
            const conversationId = `${userRolesData.user_id}_${costume.id}_${costume.lender_user_id}`;
            router.push(`/costumes/chat?conversationId=${conversationId}`);
        } catch (error) {
            toast.error("Failed to send inquiry. Please try again.");
        }
    };

    const handleEditCostume = async () => {
        if (!userRolesData) return;
        const navigateToEdit = () => {
            router.push(`/lender/products/list`);
        };
        try {
            if (userRolesData.current_role === 'lender') {
                navigateToEdit();
            } else if (userRolesData.roles.includes('lender')) {
                await switchRole(
                    { userId: userRolesData.user_id, targetRole: 'lender' },
                    {
                        onSuccess: () => {
                            toast.info("Successfully switched to lender mode. Redirecting...");
                            navigateToEdit();
                        },
                    }
                );
            }
        } catch (error) {
            toast.error("Failed to switch role or navigate.");
        }
    };

    const getAvailabilityStatus = () => {
        if (!costume.status || costume.status === 'inactive') return { text: 'Unavailable', variant: 'destructive' as const };
        return { text: 'Available', variant: 'default' as const };
    };
    const availabilityStatus = getAvailabilityStatus();
    const isOwner = isAuthenticated && userRolesData && userRolesData.user_id === costume.lender_user_id;

    // Rent/Sale UI logic
    const hasRent = costume.listing_type === 'rent' || costume.listing_type === 'both';
    const hasSale = costume.listing_type === 'sale' || costume.listing_type === 'both';
    const rentOffer = costume.rent?.main_rent_offer;
    const altRentOffers = costume.rent?.alternative_rent_offers || [];
    const saleOffer = costume.sale;

    return (
        <Card className="w-full shadow-sm border-0 ring-1 ring-border">
            <CardHeader className="pb-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate" title={costume.name}>
                                {costume.name}
                            </CardTitle>
                            <Badge
                                variant={availabilityStatus.variant}
                                className={cn(
                                    "text-xs sm:text-sm",
                                    availabilityStatus.variant === 'default' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''
                                )}
                            >
                                {availabilityStatus.text}
                            </Badge>
                            <Badge
                                className={cn(
                                    'text-xs sm:text-sm',
                                    costume.listing_type === 'both' ? 'bg-rose-500 text-white' : costume.listing_type === 'rent' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
                                )}
                            >
                                {costume.listing_type === 'both' ? 'For Rent & Sale' : costume.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                            </Badge>
                        </div>
                        {costume.brand && (
                            <p className="text-sm sm:text-base text-muted-foreground flex items-center truncate" title={costume.brand}>
                                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{costume.brand}</span>
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-rose-50 hover:text-rose-600 self-start sm:self-auto h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
                        aria-label="Add to Wishlist"
                    >
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-rose-200 text-rose-700 text-xs sm:text-sm">
                            {costume.category}
                        </Badge>
                        {costume.gender && (
                            <Badge variant="secondary" className="text-xs sm:text-sm capitalize">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                {costume.gender}
                            </Badge>
                        )}
                        {costume.sizes && (
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                <Package className="h-3 w-3 mr-1 flex-shrink-0" />
                                {costume.sizes}
                            </Badge>
                        )}
                    </div>
                    {costume.tags && costume.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {costume.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs truncate max-w-[60px]" title={tag}>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Rent & Sale Section */}
                <div className="space-y-3">
                    {hasRent && rentOffer && (
                        <div className="flex flex-col gap-2 p-4 rounded-lg border border-blue-200 bg-blue-50/30">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500 text-white px-2 py-0.5 text-xs font-semibold">Rent</Badge>
                                <span className="text-lg font-bold text-blue-700">{formatCurrency(rentOffer.price)}</span>
                                <span className="text-xs text-muted-foreground">/{rentOffer.type}</span>
                            </div>
                            {altRentOffers && altRentOffers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {altRentOffers.map((offer, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {formatCurrency(offer.price)} / {offer.type}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {hasSale && saleOffer && (
                        <div className="flex flex-col gap-2 p-4 rounded-lg border border-pink-200 bg-pink-50/30">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-pink-500 text-white px-2 py-0.5 text-xs font-semibold">Sale</Badge>
                                <span className="text-lg font-bold text-pink-700">{formatCurrency(saleOffer.price)}</span>
                                {saleOffer.discount > 0 && (
                                    <span className="text-xs text-muted-foreground line-through ml-1">{formatCurrency(Number(saleOffer.price) / (1 - saleOffer.discount / 100))}</span>
                                )}
                                {saleOffer.discount > 0 && (
                                    <Badge variant="destructive" className="text-xs ml-2">-{saleOffer.discount}%</Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <Separator />
                {/* Add-ons Section */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-rose-600 flex-shrink-0" />
                        Add-ons & Extras
                    </h3>
                    {costume.add_ons && costume.add_ons.length > 0 ? (
                        <div className="grid gap-3">
                            {costume.add_ons.map((addon) => (
                                <div
                                    key={addon.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border hover:border-rose-200 transition-colors gap-3"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        {addon.image ? (
                                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border flex-shrink-0">
                                                <Image
                                                    src={addon.image}
                                                    alt={addon.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 40px, 48px"
                                                />
                                            </div>
                                        ) : (
                                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                                <AvatarFallback className="bg-rose-50 text-rose-600 text-xs sm:text-sm">
                                                    {addon.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <span className="text-xs sm:text-sm font-medium truncate">{addon.name}</span>
                                            {addon.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {addon.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-semibold text-rose-600 flex-shrink-0">
                                        {formatCurrency(addon.price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6 rounded-lg border border-dashed text-center">
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                No add-ons available for this costume
                            </p>
                        </div>
                    )}
                </div>
                <Separator />
                {/* Description Section */}
                <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Description</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-6">
                        {costume.description || "No description available for this costume."}
                    </p>
                </div>
                <Separator />
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    {isOwner ? (
                        <div className="w-full flex flex-col items-center justify-center p-4 border border-dashed rounded-lg bg-accent/40">
                            <p className="text-foreground text-center font-medium mb-3 text-sm sm:text-base">This is your costume post.</p>
                            <Button
                                variant="secondary"
                                className="text-rose-700 cursor-pointer border-rose-200 hover:bg-rose-50 w-full sm:w-auto touch-manipulation"
                                onClick={handleEditCostume}
                                disabled={isSwitchingRole}
                            >
                                {isSwitchingRole ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Switching Role...
                                    </>
                                ) : (
                                    "Edit Costume"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                size="default"
                                onClick={handleInquireNow}
                                className="bg-rose-600 hover:bg-rose-700 text-white transition-colors h-11 sm:h-12 text-sm sm:text-base font-medium touch-manipulation"
                                disabled={isSendMessageLoading || isLoading || !costume.status}
                            >
                                {isSendMessageLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Inquire Now
                                    </>
                                )}
                            </Button>
                            <Button
                                size="default"
                                variant="outline"
                                className="border-rose-600 text-rose-600 hover:bg-rose-50 transition-colors h-11 sm:h-12 text-sm sm:text-base font-medium touch-manipulation"
                                disabled={isSendMessageLoading || isLoading}
                                aria-label="Add to Wishlist"
                            >
                                <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                Add to Wishlist
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

CostumeInfo.displayName = 'CostumeInfo';

export default CostumeInfo;
