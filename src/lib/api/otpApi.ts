// src/api/otp.ts
import { useMutation } from "@tanstack/react-query"
import { axiosApiClient } from "./axiosApiClient"
import { toast } from "sonner"

// ============================================================
// Send OTP Code
// ============================================================
export const useSendOtpCode = () => {
    const sendOtpCodeApiRequest = async (email: string) => {
        const response = await axiosApiClient.post("/otp/send-otp", { email })
        return response.data
    }

    const mutation = useMutation({
        mutationFn: sendOtpCodeApiRequest,
        onSuccess: () => {
            toast.success("OTP sent successfully!")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Failed to send OTP.")
            console.error("❌ Error sending OTP:", error)
        },
    })

    return {
        sendOtpCode: mutation.mutateAsync,
        isSending: mutation.isPending,
    }
}

// ============================================================
// Verify OTP Code
// ============================================================
export const useVerifyOtpCode = () => {
    const verifyOtpCodeApiRequest = async ({
        email,
        otp,
    }: {
        email: string
        otp: string
    }) => {
        const response = await axiosApiClient.post("/otp/verify-otp", { email, otp })
        return response.data
    }

    const mutation = useMutation({
        mutationFn: verifyOtpCodeApiRequest,
        onSuccess: () => {
            toast.success("OTP verified successfully!")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "OTP verification failed.")
            console.error("❌ Error verifying OTP:", error)
        },
    })

    return {
        verifyOtpCode: mutation.mutateAsync,
        isVerifying: mutation.isPending,
    }
}

// ============================================================
// Resend OTP Code (alias of sendOtpCode)
// ============================================================
export const useResendOtpCode = () => {
    const resendOtpApiRequest = async (email: string) => {
        const response = await axiosApiClient.post("/otp/resend-otp", { email })
        return response.data
    }

    const mutation = useMutation({
        mutationFn: resendOtpApiRequest,
        onSuccess: () => {
            toast.success("OTP resent successfully!")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Failed to resend OTP.")
            console.error("❌ Error resending OTP:", error)
        },
    })

    return {
        resendOtpCode: mutation.mutateAsync,
        isResending: mutation.isPending,
    }
}
