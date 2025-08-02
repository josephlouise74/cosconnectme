import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Store, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'



const HeroSection = ({ emblaRef, scrollPrev, scrollNext, scrollTo, selectedDot, isBorrowerAuthenticated }: any) => {

    // Hero images data
    const heroImages = [
        {
            id: 1,
            src: 'https://ajmhkwiqsnuilsacrxby.supabase.co/storage/v1/object/public/monkey-images/cosplay-images/adrian-henry-2abwZRH4l-Q-unsplash.jpg',
            alt: 'Medieval Knight Costume',
            title: isBorrowerAuthenticated ? 'Welcome Back!' : 'Rent or List Your Costumes',
            description: isBorrowerAuthenticated ? 'Explore our latest costume collections and find your perfect outfit for your next event.' : 'Join our community of cosplay enthusiasts. Rent unique costumes or earn by listing yours.',
        },
        {
            id: 2,
            src: 'https://ajmhkwiqsnuilsacrxby.supabase.co/storage/v1/object/public/monkey-images/cosplay-images/le-anh-bIX6FYUwSq4-unsplash.jpg',
            alt: 'Space Explorer Costume',
            title: isBorrowerAuthenticated ? 'Discover New Costumes' : 'Borrower or Lender?',
            description: isBorrowerAuthenticated ? 'Browse through our extensive collection of unique and high-quality costumes.' : 'Choose your role: Borrow amazing costumes or list your collection to earn.',
        },
        {
            id: 3,
            src: 'https://ajmhkwiqsnuilsacrxby.supabase.co/storage/v1/object/public/monkey-images/cosplay-images/44.jpg',
            alt: 'Fairy Princess Costume',
            title: isBorrowerAuthenticated ? 'Ready to Rent?' : 'Safe and Secure',
            description: isBorrowerAuthenticated ? 'Find and book your next costume with just a few clicks.' : 'Trusted platform for costume rentals with secure transactions and insurance options.',
        },
        {
            id: 4,
            src: 'https://ajmhkwiqsnuilsacrxby.supabase.co/storage/v1/object/public/monkey-images/cosplay-images/ashley-levinson-_0wsTjvYFLI-unsplash.jpg',
            alt: 'Zombie Apocalypse Costume',
            title: isBorrowerAuthenticated ? 'Start Browsing' : 'Flexible Rental Options',
            description: isBorrowerAuthenticated ? 'Check out our latest additions and featured costumes.' : 'Set your own rental terms and prices as a lender, or find the perfect costume as a borrower.',
        },
    ];



    return (
        <>
            <section className="relative h-[80vh] w-full overflow-hidden">
                <div className="embla h-full" ref={emblaRef}>
                    <div className="embla__container h-full">
                        {heroImages.map((image: any) => (
                            <div key={image.id} className="embla__slide">
                                <div className="relative h-full w-full">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="100vw"
                                    />
                                    <div className="absolute inset-0 bg-black/60" />
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="container mx-auto px-4">
                                            <div className="max-w-2xl text-white">
                                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-heading">
                                                    {image.title}
                                                </h1>
                                                <p className="text-lg md:text-xl mb-8 text-gray-200">
                                                    {image.description}
                                                </p>
                                                {!isBorrowerAuthenticated && (
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <Link href="/signin?role=borrower">
                                                            <Button
                                                                size="lg"
                                                                className="cursor-pointer gap-2 bg-rose-600 hover:bg-rose-700 transition-colors text-white"
                                                            >
                                                                <User className="h-4 w-4" /> Become a Borrower
                                                            </Button>
                                                        </Link>
                                                        <Link href="/signin">
                                                            <Button
                                                                size="lg"
                                                                className="cursor-pointer gap-2 bg-rose-600 hover:bg-rose-700 transition-colors text-white"
                                                            >
                                                                <Store className="h-4 w-4" /> Become a Lender
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <Button
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onClick={scrollPrev}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onClick={scrollNext}
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>

                {/* Dots Navigation */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {heroImages.map((_: any, index: any) => (
                        <Button
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors ${selectedDot === index
                                ? 'bg-rose-600'
                                : 'bg-white/50 hover:bg-rose-400'
                                }`}
                            onClick={() => scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export default React.memo(HeroSection)
