// components/rentals/lender-rental-details/RenterInformation.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Truck } from "lucide-react"

interface RenterInformationProps {
    renterSnapshot: any
}

export function RenterInformation({ renterSnapshot }: RenterInformationProps) {
    if (!renterSnapshot) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Renter Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <img
                            src="/images/default-avatar.jpg"
                            alt={renterSnapshot?.name || "Renter"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                            {renterSnapshot?.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                            ID: {renterSnapshot?.uid}
                        </p>
                    </div>
                </div>
                <Separator />
                <div className="space-y-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">
                            {renterSnapshot?.email}
                        </span>
                    </div>
                    {renterSnapshot?.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">
                                {renterSnapshot.phone}
                            </span>
                        </div>
                    )}
                    {renterSnapshot?.address && (
                        <div className="flex items-start gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm">
                                {renterSnapshot.address}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}