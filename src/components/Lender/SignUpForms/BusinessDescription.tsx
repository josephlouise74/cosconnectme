// components/BusinessDescriptionSection.tsx
import { Control, useWatch } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LenderSignUpFormData } from "@/lib/zodSchema/lenderSchema";

interface BusinessDescriptionSectionProps {
    control: Control<LenderSignUpFormData>;
}

export const BusinessDescriptionSection = ({ control }: BusinessDescriptionSectionProps) => {
    const selectedBusinessType = useWatch({ control, name: "businessType" });

    // Only show for STORE type
    if (selectedBusinessType !== "STORE") {
        return null;
    }

    return (
        <FormField
            control={control}
            name="businessDescription"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Business Description *</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Textarea
                                placeholder="Tell us about your business, what types of costumes you offer, and your experience..."
                                className="resize-none h-32"
                                maxLength={500}
                                {...field}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                {(field.value?.length || 0)}/500
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};