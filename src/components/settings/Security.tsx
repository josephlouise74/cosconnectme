
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import React from 'react'

const SecuritySettings = React.memo(() => (
    <Card>
        <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Security Settings</h3>
            <p className="text-muted-foreground">
                This feature is coming soon. You'll be able to manage your password,
                two-factor authentication, and other security settings here.
            </p>
        </CardContent>
    </Card>
))

SecuritySettings.displayName = 'SecuritySettings'

export default SecuritySettings
