'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    AlertTriangle,
    RefreshCw,
    Home,
    Copy,
    Bug,
    Clock,
    AlertCircle,
    Database,
    Shield,
    Globe
} from 'lucide-react'
import { Suspense, useState } from 'react'

const getErrorIcon = (errorType: string) => {
    switch (errorType) {
        case 'oauth_provider_error':
            return <Globe className="h-5 w-5" />
        case 'session_exchange_failed':
            return <Shield className="h-5 w-5" />
        case 'database_insert_error':
        case 'database_select_error':
            return <Database className="h-5 w-5" />
        case 'missing_code':
        case 'no_user_data':
            return <AlertCircle className="h-5 w-5" />
        default:
            return <Bug className="h-5 w-5" />
    }
}

const getErrorTypeLabel = (errorType: string) => {
    switch (errorType) {
        case 'oauth_provider_error':
            return 'OAuth Provider Error'
        case 'session_exchange_failed':
            return 'Session Exchange Failed'
        case 'database_insert_error':
            return 'Database Insert Error'
        case 'database_select_error':
            return 'Database Select Error'
        case 'missing_code':
            return 'Missing Authorization Code'
        case 'no_user_data':
            return 'No User Data'
        case 'unexpected_error':
            return 'Unexpected Error'
        default:
            return 'Unknown Error'
    }
}

const getErrorSeverity = (errorType: string) => {
    switch (errorType) {
        case 'oauth_provider_error':
        case 'missing_code':
            return 'destructive'
        case 'session_exchange_failed':
        case 'database_insert_error':
        case 'database_select_error':
            return 'destructive'
        case 'no_user_data':
        case 'unexpected_error':
            return 'destructive'
        default:
            return 'secondary'
    }
}

export default function ErrorPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [copied, setCopied] = useState(false)

    const errorType = searchParams.get('error_type') || 'unknown_error'
    const errorCode = searchParams.get('error_code') || 'UNKNOWN'
    const errorMessage = searchParams.get('error_message') || 'An unknown error occurred'
    const errorDetails = searchParams.get('error_details') || ''
    const errorHint = searchParams.get('error_hint') || ''
    const timestamp = searchParams.get('timestamp') || new Date().toISOString()

    const errorInfo = {
        type: errorType,
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        timestamp: timestamp,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    }

    const copyErrorInfo = async () => {
        const errorText = `
Error Report
============
Type: ${errorInfo.type}
Code: ${errorInfo.code}
Message: ${errorInfo.message}
Details: ${errorInfo.details}
Hint: ${errorInfo.hint}
Timestamp: ${errorInfo.timestamp}
URL: ${errorInfo.url}
User Agent: ${errorInfo.userAgent}
        `.trim()

        try {
            await navigator.clipboard.writeText(errorText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy error info:', err)
        }
    }

    const handleRetry = () => {
        // Go back to sign in page
        router.push('/signin')
    }

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <Suspense fallback={"...loading"}>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Main Error Card */}
                    <Card className="shadow-lg border-red-200">
                        <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-red-900">
                                Authentication Error
                            </CardTitle>
                            <CardDescription className="text-red-700">
                                Something went wrong during the sign-in process
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Error Type Badge */}
                            <div className="flex items-center justify-center gap-2">
                                <Badge variant={getErrorSeverity(errorType)} className="flex items-center gap-1 px-3 py-1">
                                    {getErrorIcon(errorType)}
                                    {getErrorTypeLabel(errorType)}
                                </Badge>
                            </div>

                            {/* Error Message */}
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="font-medium">
                                    {errorMessage}
                                </AlertDescription>
                            </Alert>

                            {/* Additional Details */}
                            {(errorDetails || errorHint) && (
                                <div className="space-y-3">
                                    {errorDetails && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm font-medium text-red-800 mb-1">Details:</p>
                                            <p className="text-sm text-red-700">{errorDetails}</p>
                                        </div>
                                    )}
                                    {errorHint && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800 mb-1">Hint:</p>
                                            <p className="text-sm text-blue-700">{errorHint}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={handleRetry} className="flex-1 flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={handleGoHome} variant="outline" className="flex-1 flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Debug Information Card */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Bug className="h-5 w-5" />
                                Debug Information
                            </CardTitle>
                            <CardDescription>
                                Technical details for debugging (safe to share with support)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-medium text-gray-700">Error Code:</span>
                                        <Badge variant="secondary" className="ml-2 font-mono">
                                            {errorCode}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Error Type:</span>
                                        <span className="ml-2 text-gray-600 font-mono">{errorType}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Timestamp:</span>
                                    </div>
                                    <p className="text-gray-600 font-mono text-xs">
                                        {new Date(timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Copy this information when reporting the issue
                                </p>
                                <Button
                                    onClick={copyErrorInfo}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    {copied ? 'Copied!' : 'Copy Info'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Text */}
                    <div className="text-center text-sm text-gray-600 space-y-2">
                        <p>
                            If this error persists, please contact support with the debug information above.
                        </p>
                        <p className="text-xs text-gray-500">
                            Error ID: {errorCode}-{Date.now().toString(36).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </Suspense>
    )
}