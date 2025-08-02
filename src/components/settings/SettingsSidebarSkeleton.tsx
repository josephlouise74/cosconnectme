import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// Skeleton component for the settings sidebar
const SettingsSidebarSkeleton = () => (
    <Card className="sticky top-6">
        <CardHeader className="pb-4">
            <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="p-0">
            <div className="grid w-full grid-rows-4 h-auto bg-transparent p-2 space-y-2">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center px-4 py-3">
                        <Skeleton className="w-4 h-4 mr-3" />
                        <Skeleton className="h-4 flex-1" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
)

export default React.memo(SettingsSidebarSkeleton)