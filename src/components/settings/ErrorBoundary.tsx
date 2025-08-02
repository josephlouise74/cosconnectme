import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import React from 'react'

interface ErrorBoundaryProps {
    error: string
    onRetry: () => void
}

const ErrorBoundary = React.memo<ErrorBoundaryProps>(({ error, onRetry }) => (
    <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                        onClick={onRetry}
                        variant="outline"
                        size="sm"
                        className="ml-4"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try again
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    </div>
))

ErrorBoundary.displayName = 'ErrorBoundary'

export default ErrorBoundary
