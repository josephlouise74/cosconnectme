"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CostumeItem } from '@/lib/types/marketplaceType';

import { Clock, Heart, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

interface CostumeCardProps {
  costume: CostumeItem;
  onAddToWishlist: (costumeId: string) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const slugify = (text: string): string =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getRentPrice = (costume: CostumeItem) => {
  if (costume.rent?.main_rent_offer?.price) {
    return {
      price: parseFloat(costume.rent.main_rent_offer.price),
      type: costume.rent.main_rent_offer.type || 'day',
    };
  }
  return null;
};

const getSalePrice = (costume: CostumeItem) => {
  if (costume.sale?.price) {
    const original = parseFloat(costume.sale.price);
    const discount = costume.sale.discount || 0;
    const discounted = original - (original * (discount / 100));
    return { original, discounted, discount };
  }
  return null;
};

const getListingLabel = (type: string) => {
  if (type === 'both') return 'For Rent & Sale';
  if (type === 'rent') return 'For Rent';
  if (type === 'sale') return 'For Sale';
  return '';
};

const getListingColor = (type: string) => {
  if (type === 'both') return 'bg-rose-500 text-white';
  if (type === 'rent') return 'bg-blue-500 text-white';
  if (type === 'sale') return 'bg-pink-500 text-white';
  return '';
};

const CostumeCard: React.FC<CostumeCardProps> = ({ costume, onAddToWishlist }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rent = getRentPrice(costume);
  const sale = getSalePrice(costume);
  const isAvailable = costume.is_available && costume.status === 'active';

  const displayImage = useMemo(() => {
    if (imageError) return '/placeholder-costume.jpg';
    if (isHovered && costume.main_images.back) return costume.main_images.back;
    return costume.main_images.front || '/placeholder-costume.jpg';
  }, [isHovered, costume.main_images, imageError]);

  const handleCardClick = useCallback(() => {
    const query = new URLSearchParams({
      product: `${costume.name}_${costume.brand}`,
      type: costume.listing_type,
      id: costume.id,
    });
    const slugifiedName = slugify(costume.name);
    router.push(`/marketplace/${slugifiedName}?${query.toString()}`);
  }, [costume, router]);

  const handleAddToWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToWishlist(costume.id);
    },
    [costume.id, onAddToWishlist]
  );

  // Action buttons for rent/sale
  const renderActions = () => {
    if (!isAvailable) {
      return (
        <Button className="w-full" size="sm" disabled>
          Unavailable
        </Button>
      );
    }
    if (costume.listing_type === 'both') {
      return (
        <div className="flex gap-2">
          {rent && (
            <Button
              className="flex-1 font-semibold border-2 border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <Clock className="h-4 w-4 mr-1" /> Rent
            </Button>
          )}
          {sale && (
            <Button
              className="flex-1 font-semibold border-2 border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition-colors"
              size="sm"
              variant="secondary"
              onClick={e => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> Buy
            </Button>
          )}
        </div>
      );
    }
    if (costume.listing_type === 'rent' && rent) {
      return (
        <Button
          className="w-full font-semibold border-2 border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <Clock className="h-4 w-4 mr-1" /> Rent Now
        </Button>
      );
    }
    if (costume.listing_type === 'sale' && sale) {
      return (
        <Button
          className="w-full font-semibold border-2 border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition-colors"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now
        </Button>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <Card
        className="group cursor-pointer flex flex-col h-full min-h-[420px] bg-white border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Listing Type Indicator */}
        <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getListingColor(costume.listing_type)}`}>
          {getListingLabel(costume.listing_type)}
        </div>
        {/* Image Section */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
          <Image
            src={displayImage}
            alt={`${costume.name} by ${costume.brand}`}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
          />
          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white z-10"
            onClick={handleAddToWishlist}
            tabIndex={0}
            aria-label="Add to wishlist"
          >
            <Heart className="h-5 w-5 text-rose-500" />
          </Button>
          {/* Unavailable Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <Badge variant="destructive" className="text-base px-4 py-2">Unavailable</Badge>
            </div>
          )}
          {/* Listing type badge (for accessibility, visually hidden) */}
          <span className="sr-only">{getListingLabel(costume.listing_type)}</span>
        </div>

        {/* Info Section */}
        <CardContent className="flex flex-col flex-1 justify-between p-4 gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-base truncate leading-tight" title={costume.name}>{costume.name}</h3>
            <p className="text-xs text-muted-foreground truncate" title={costume.brand}>by <span className="font-medium">{costume.brand}</span></p>
          </div>

          {/* Price Section */}
          <div className="flex flex-col gap-1">
            {costume.listing_type === 'both' && (
              <div className="flex flex-col gap-1">
                {rent && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white px-2 py-0.5 text-xs font-semibold">Rent</Badge>
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-sm">{formatCurrency(rent.price)}</span>
                    <span className="text-xs text-muted-foreground">/{rent.type}</span>
                  </div>
                )}
                {sale && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-500 text-white px-2 py-0.5 text-xs font-semibold">Sale</Badge>
                    <ShoppingCart className="h-4 w-4 text-pink-500" />
                    <span className="font-semibold text-sm">{formatCurrency(sale.discounted)}</span>
                    {sale.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through ml-1">{formatCurrency(sale.original)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {costume.listing_type === 'rent' && rent && (
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white px-2 py-0.5 text-xs font-semibold">Rent</Badge>
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">{formatCurrency(rent.price)}</span>
                <span className="text-xs text-muted-foreground">/{rent.type}</span>
              </div>
            )}
            {costume.listing_type === 'sale' && sale && (
              <div className="flex items-center gap-2">
                <Badge className="bg-pink-500 text-white px-2 py-0.5 text-xs font-semibold">Sale</Badge>
                <ShoppingCart className="h-4 w-4 text-pink-500" />
                <span className="font-semibold text-sm">{formatCurrency(sale.discounted)}</span>
                {sale.discount > 0 && (
                  <span className="text-xs text-muted-foreground line-through ml-1">{formatCurrency(sale.original)}</span>
                )}
              </div>
            )}
          </div>

          {/* Meta Section */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              {costume.gender}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {costume.sizes}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {costume.category}
            </Badge>
            {costume.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs truncate max-w-[60px]" title={tag}>
                {tag}
              </Badge>
            ))}
            {costume.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{costume.tags.length - 2} more
              </Badge>
            )}
          </div>

          {/* Action Section */}
          <div className="mt-4">{renderActions()}</div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CostumeCard;