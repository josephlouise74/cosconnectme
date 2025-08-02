
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Store, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


const CTASection = () => {
    return (
        <section className={cn(
            "py-16",
            "bg-background  dark:bg-background-dark",
            "border-t border-border dark:border-border-dark"
        )}>
            <div className="container mx-auto px-4 text-center">
                <h2 className={cn(
                    "text-3xl font-bold mb-6 font-heading",
                    "text-text dark:text-text-dark"
                )}>
                    Ready to Get Started?
                </h2>
                <p className={cn(
                    "text-xl mb-8 max-w-2xl mx-auto",
                    "text-text-muted dark:text-text-muted-dark"
                )}>
                    Join our community of cosplay enthusiasts and start your journey today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className={cn(
                                "gap-2",
                                "bg-rose-600 hover:bg-rose-700",
                                "text-white",
                                "transition-colors duration-300 cursor-pointer",
                                "shadow-md hover:shadow-lg"
                            )}
                        >
                            <User className="h-4 w-4" /> Register as Borrower
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className={cn(
                                "gap-2",
                                "bg-rose-600 hover:bg-rose-700",
                                "text-white",
                                "transition-colors duration-300 cursor-pointer",
                                "shadow-md hover:shadow-lg"
                            )}
                        >
                            <Store className="h-4 w-4" /> Register as Lender
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default React.memo(CTASection)
