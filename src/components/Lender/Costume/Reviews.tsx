"use client"
// Reviews.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import React from 'react';

export const Reviews = React.memo(() => {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 rounded-lg bg-accent/50 border border-border text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No reviews yet for this costume</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first to share your experience!</p>
                </div>
            </CardContent>
        </Card>
    );
});