// SendMessageModal.tsx
"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useSendMessage } from '@/lib/api/messageApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Define the Zod schema for form validation
const sendMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(1000, 'Message must be 1000 characters or less')
})

type SendMessageFormData = z.infer<typeof sendMessageSchema>

interface SendMessageModalProps {
    isOpen: boolean
    onClose: () => void
    recipientName: string
    recipientUsername: string
    recipientId: string
    senderId: string
    senderUsername: string
}

const SendMessageModal = ({
    isOpen,
    onClose,
    recipientName,
    recipientUsername,
    recipientId,
    senderId,
    senderUsername
}: SendMessageModalProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<SendMessageFormData>({
        resolver: zodResolver(sendMessageSchema),
    })

    const router = useRouter()

    const { sendMessage } = useSendMessage()

    const onSubmit = async (data: SendMessageFormData) => {
        try {
            // Ensure we have valid sender and recipient IDs
            if (!senderId || !recipientId) {
                console.error('Missing sender or recipient information')
                return
            }

            // Determine user1_id and user2_id (sorted to ensure consistency)
            const [user1_id, user2_id] = [senderId, recipientId].sort()

            const messageData = {
                message: data.message,
                sender_id: senderId,
                sender_username: senderUsername,
                receiver_id: recipientId,
                receiver_username: recipientUsername,
                message_type: 'text' as const, // Explicit typing for TypeScript
                user1_id,
                user2_id
            }

            // Use the API hook to send the message
            sendMessage(messageData as any)

            reset()
            onClose()

            router.push(`/messages/${recipientUsername}`)

        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            reset()
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[525px] p-6">
                <DialogHeader className="relative">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Send Message to {recipientName}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-8 w-8"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">To:</span>
                        <span>@{recipientUsername}</span>
                    </div>
                    <div className="space-y-2">
                        <Textarea
                            {...register('message')}
                            placeholder="Type your message here..."
                            className="min-h-[120px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                            disabled={isSubmitting}
                        />
                        {errors.message && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {errors.message.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SendMessageModal