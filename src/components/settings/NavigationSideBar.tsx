import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Store, Trash2, Shield, LucideIcon } from 'lucide-react'

interface NavigationTab {
    value: string
    label: string
    icon: LucideIcon
    className: string
}

const navigationTabs: NavigationTab[] = [
    {
        value: 'personal',
        label: 'Personal Details',
        icon: User,
        className: 'data-[state=active]:bg-primary data-[state=active]:text-white'
    },
    {
        value: 'lender',
        label: 'Lender Account',
        icon: Store,
        className: 'data-[state=active]:bg-primary data-[state=active]:text-white'
    },
    {
        value: 'security',
        label: 'Security',
        icon: Shield,
        className: 'data-[state=active]:bg-primary data-[state=active]:text-white'
    },
    {
        value: 'delete',
        label: 'Delete Account',
        icon: Trash2,
        className: 'text-red-600 hover:text-red-700 data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/20'
    }
]

interface NavigationSidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const NavigationSidebar = React.memo<NavigationSidebarProps>(({ activeTab, onTabChange }) => (
    <Card className="sticky top-6">
        <CardHeader className="pb-4">
            <CardTitle className="text-lg">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={onTabChange} orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-rows-4 h-auto bg-transparent p-2">
                    {navigationTabs.map(({ value, label, icon: Icon, className }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className={`w-full justify-start px-4 py-3 ${className}`}
                        >
                            <Icon className="w-4 h-4 mr-3" />
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </CardContent>
    </Card>
))

NavigationSidebar.displayName = 'NavigationSidebar'

export default NavigationSidebar