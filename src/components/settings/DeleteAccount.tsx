
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'

const DeleteAccount = () => {
    const [confirmationText, setConfirmationText] = React.useState('')
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        if (confirmationText !== 'DELETE') {
            toast.error('Please type DELETE to confirm')
            return
        }

        try {
            setIsDeleting(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Account deleted successfully')
            // Handle logout or redirect here
        } catch (error) {
            toast.error('Failed to delete account')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-red-600">Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                            Warning: This action cannot be undone
                        </h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirmation">
                                Type DELETE to confirm
                            </Label>
                            <Input
                                id="confirmation"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="Type DELETE"
                                className="max-w-xs"
                            />
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full max-w-xs"
                                    disabled={confirmationText !== 'DELETE' || isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove all associated data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default DeleteAccount