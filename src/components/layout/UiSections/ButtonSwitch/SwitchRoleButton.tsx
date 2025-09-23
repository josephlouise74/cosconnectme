import { Button } from "@/components/ui/button";
import { useSwitchRole } from "@/lib/api/userApi";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

export default function SwitchRoleButton({ iconOnly = false, ...props }: { iconOnly?: boolean; afterSwitch?: () => void }) {
    const { userRolesData, isLoading } = useSupabaseAuth();
    const { isLoading: isSwitching, mutateAsync: switchRole } = useSwitchRole();
    const [error, setError] = useState<string | null>(null);

    const getTargetRole = () => {
        if (!userRolesData?.current_role) return null;
        return userRolesData.current_role === "lender" ? "borrower" : "lender";
    };

    const getTargetRoleLabel = () => {
        const target = getTargetRole();
        if (target === "lender") return "Switch to Lender";
        if (target === "borrower") return "Switch to Borrower";
        return "Switch Role";
    };

    const handleSwitchRole = async () => {
        setError(null);
        const targetRole = getTargetRole();
        if (!userRolesData?.user_id || !targetRole) {
            setError("User ID or target role not found.");
            return;
        }
        try {
            await switchRole({ userId: userRolesData.user_id, targetRole });
            if (props.afterSwitch) props.afterSwitch();
            // Optionally, refresh user data or redirect here
        } catch (err: any) {
            setError(err.message || "Failed to switch role.");
        }
    };

    if (!userRolesData?.can_switch_roles) return null;

    return (
        <Button
            onClick={handleSwitchRole}
            disabled={isSwitching || isLoading}
            className={iconOnly ? "w-10 h-10 p-0 flex items-center justify-center" : "w-full"}
            variant={iconOnly ? "ghost" : "outline"}
            title={getTargetRoleLabel()}
        >
            <ArrowRightLeft className="h-5 w-5" />
            {!iconOnly && (
                <span className="ml-2">{isSwitching ? "Switching..." : getTargetRoleLabel()}</span>
            )}
        </Button>
    );
}