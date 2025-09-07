import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useState } from "react";

interface DamageReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (damageDetails: { cost: number; description: string }) => void | Promise<void>;
    isUpdating: boolean;
    securityDeposit?: number;
}

export default function DamageReportDialog({
    isOpen,
    onClose,
    onSubmit,
    isUpdating,
    securityDeposit = 0
}: DamageReportDialogProps) {
    const [damageCost, setDamageCost] = useState<number>(0);
    const [damageDescription, setDamageDescription] = useState<string>("");
    const [errors, setErrors] = useState<{ cost?: string; description?: string }>({});

    const handleSubmit = async () => {
        const newErrors: { cost?: string; description?: string } = {};

        if (!damageCost || damageCost <= 0) {
            newErrors.cost = "Please enter a valid damage cost";
        } else if (damageCost > securityDeposit) {
            newErrors.cost = `Cost cannot exceed security deposit (₱${securityDeposit.toLocaleString()})`;
        }

        if (!damageDescription.trim()) {
            newErrors.description = "Please provide damage details";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            await onSubmit({ cost: damageCost, description: damageDescription });
            resetForm();
        }
    };

    const resetForm = () => {
        setDamageCost(0);
        setDamageDescription("");
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                        Report Costume Damage
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Report any damage to the costume and deduct from the security deposit.
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="damage-cost">
                            Damage Cost <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                            <Input
                                id="damage-cost"
                                type="number"
                                min="0"
                                max={securityDeposit}
                                step="0.01"
                                value={damageCost || ""}
                                onChange={(e) => setDamageCost(parseFloat(e.target.value) || 0)}
                                className="pl-7"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}

                        <p className="text-xs text-muted-foreground mt-1">
                            Security Deposit Available: ₱{securityDeposit.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="damage-description">
                            Damage Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="damage-description"
                            value={damageDescription}
                            onChange={(e) => setDamageDescription(e.target.value)}
                            placeholder="Describe the damage in detail..."
                            className="min-h-[100px]"
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="mt-2 sm:mt-0"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Shield className="h-4 w-4 mr-2" />
                        )}
                        Submit Damage Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}