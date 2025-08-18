"use client"

import {
    CreditCard,
    Edit,
    Grid,
    LayoutDashboard,
    ListOrdered,
    LogOut,
    Menu,
    MessageCircle,
    Moon,
    Package,
    PlusCircle,
    Settings,
    ShoppingCart,
    Sun,
    Users2Icon,
    type LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { cn } from "@/lib/utils";
import { signOut } from "actions/auth";

// Types
interface SidebarChildItem {
    title: string;
    icon: LucideIcon;
    href: string;
    badge?: number;
}

interface SidebarItem {
    title: string;
    icon: LucideIcon;
    href?: string;
    badge?: number;
    children?: SidebarChildItem[];
}

// Constants
const SIDEBAR_COLLAPSED_WIDTH = 20;
const SIDEBAR_EXPANDED_WIDTH = 72;
const HOVER_DELAY = 200;

// Navigation Item Component
const NavItem = memo<{
    item: SidebarItem;
    isActive: boolean;
    isCollapsed: boolean;
    pathname: string;
}>(({ item, isActive, isCollapsed, pathname }) => {
    const { title, icon: Icon, href, badge, children } = item;
    const hasChildren = children && children.length > 0;

    const itemClasses = cn(
        "w-full group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isCollapsed && "justify-center px-2",
        isActive && "text-rose-600 font-medium shadow-sm border-l-4 border-rose-500",
        !isActive && "text-gray-600 hover:text-rose-600"
    );

    const iconClasses = cn(
        "transition-colors duration-200 flex-shrink-0",
        isActive ? "text-rose-600" : "text-gray-400 group-hover:text-rose-500"
    );

    const renderBadge = (badgeCount?: number) => {
        if (!badgeCount || badgeCount === 0) return null;

        return (
            <Badge
                variant="destructive"
                className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 h-5 min-w-[20px] flex items-center justify-center rounded-full"
            >
                {badgeCount > 99 ? '99+' : badgeCount}
            </Badge>
        );
    };

    const renderMainItem = () => (
        <div className={itemClasses}>
            <Icon size={20} className={iconClasses} />
            {!isCollapsed && (
                <>
                    <span className="truncate flex-1">{title}</span>
                    {renderBadge(badge)}
                </>
            )}
        </div>
    );

    const renderChildItems = () => {
        if (!children || isCollapsed) return null;

        return (
            <div className="ml-8 mt-1 space-y-1 border-l-2 border-rose-100 pl-4">
                {children.map((child) => {
                    const childIsActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    const ChildIcon = child.icon;

                    return (
                        <Link key={child.title} href={child.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                                childIsActive
                                    ? "text-rose-600 font-medium border-l-4 border-rose-500"
                                    : "text-gray-500 hover:text-rose-600"
                            )}>
                                <ChildIcon
                                    size={16}
                                    className={cn(
                                        "transition-colors duration-200 flex-shrink-0",
                                        childIsActive ? "text-rose-500" : "text-gray-400"
                                    )}
                                />
                                <span className="truncate flex-1">{child.title}</span>
                                {renderBadge(child.badge)}
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full">
            {href ? (
                <Link href={href}>
                    {renderMainItem()}
                </Link>
            ) : (
                renderMainItem()
            )}
            {hasChildren && renderChildItems()}
        </div>
    );
});

NavItem.displayName = 'NavItem';

// Main Sidebar Component
const SidebarLender = memo(() => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [imageError, setImageError] = useState(false);

    // State
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    // Navigation configuration
    const navItems: SidebarItem[] = useMemo(() => [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/",
        },
        {
            title: "Community",
            icon: Users2Icon,
            href: "/community",
        },
        {
            title: "Costumes",
            icon: Package,
            children: [
                { title: "Costume Grid", icon: Grid, href: "/lender/products/list" },
                { title: "Add Costume", icon: PlusCircle, href: "/lender/products/create" },
                { title: "Edit Costume", icon: Edit, href: "/lender/products/edit" }
            ]
        },
        {
            title: "Rentals",
            icon: ShoppingCart,
            badge: 5, // Replace with actual data
            children: [
                {
                    title: "Messages",
                    icon: MessageCircle,
                    href: "/messages",
                    badge: 3 // Replace with actual data
                },
                { title: "Rental List", icon: ListOrdered, href: "/lender/rentals/list" },
                { title: "Payment History", icon: CreditCard, href: "/lender/rentals/payments" },
            ]
        },
        {
            title: "Settings",
            icon: Settings,
            href: "/settings",
        },
    ], []);

    // Utility functions
    const isPathActive = useCallback((path?: string): boolean => {
        if (!path) return false;
        return pathname === path || pathname.startsWith(`${path}/`);
    }, [pathname]);

    // Get user initials for avatar fallback
    const getUserInitials = useMemo(() => {
        if (!userRolesData?.personal_info?.full_name) return 'L';
        return userRolesData.personal_info.full_name
            .split(' ')
            .map((name: string) => name[0])
            .join('')
            .toUpperCase();
    }, [userRolesData?.personal_info?.full_name]);

    // Get user display name
    const getUserDisplayName = useMemo(() => {
        return userRolesData?.personal_info?.full_name || userRolesData?.personal_info?.username || 'Loading...';
    }, [userRolesData?.personal_info?.full_name, userRolesData?.personal_info?.username]);

    // Hover handlers
    const handleSidebarMouseEnter = useCallback(() => {
        if (isMobile) return;

        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        const timeout = setTimeout(() => {
            setIsCollapsed(false);
        }, HOVER_DELAY);

        setHoverTimeout(timeout);
    }, [isMobile, hoverTimeout]);

    const handleSidebarMouseLeave = useCallback(() => {
        if (isMobile) return;

        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        const timeout = setTimeout(() => {
            setIsCollapsed(true);
        }, HOVER_DELAY);

        setHoverTimeout(timeout);
    }, [isMobile, hoverTimeout]);

    // Logout handler
    async function handleLogout() {
        await signOut();
        router.push("/signin");
    }

    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(false);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    // Reset image error when user data changes
    useEffect(() => {
        setImageError(false);
    }, [userRolesData?.personal_info?.profile_image]);


    // Sidebar content
    const SidebarContent = useMemo(() => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 p-6 flex items-center">
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold text-rose-600">
                        Lender Panel
                    </h1>
                )}
            </div>

            <Separator className="opacity-30" />

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.title}
                            item={item}
                            isActive={isPathActive(item.href)}
                            isCollapsed={isCollapsed}
                            pathname={pathname}
                        />
                    ))}
                </nav>
            </ScrollArea>

            <Separator className="opacity-30" />

            {/* User Profile */}
            <div className={cn(
                "p-4 mx-4 my-2 rounded-lg border border-gray-200 dark:border-gray-700",
                isCollapsed && "mx-2"
            )}>
                <div className={cn(
                    "flex items-center gap-3",
                    isCollapsed && "justify-center"
                )}>
                    <div className="relative h-10 w-10 rounded-full border-2 border-rose-200 flex-shrink-0 overflow-hidden">
                        {userRolesData?.personal_info?.profile_image && !imageError ? (
                            <Image
                                src={userRolesData.personal_info.profile_image}
                                alt={getUserDisplayName}
                                fill
                                className="object-cover"
                                sizes="40px"
                                onError={(e) => {
                                    // Hide the image on error and show fallback
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    setImageError(true);
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-rose-100 text-rose-600 font-medium flex items-center justify-center text-sm">
                                {getUserInitials}
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                                {getUserDisplayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {userRolesData?.email || 'Loading...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Theme Toggle */}
            <div className={cn("p-4 mx-4", isCollapsed && "mx-2")}>
                {mounted && (
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                            isCollapsed && "px-2"
                        )}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun className="h-5 w-5" />
                                {!isCollapsed && <span>Light Mode</span>}
                            </>
                        ) : (
                            <>
                                <Moon className="h-5 w-5" />
                                {!isCollapsed && <span>Dark Mode</span>}
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Logout Button */}
            <div className={cn(
                "p-4 mx-4 mb-4",
                isCollapsed && "mx-2"
            )}>
                <Button
                    variant="destructive"
                    className={cn(
                        "w-full gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-medium",
                        isCollapsed && "px-2"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    {!isCollapsed && "Log Out"}
                </Button>
            </div>
        </div>
    ), [isCollapsed, navItems, pathname, isPathActive, userRolesData, getUserDisplayName, getUserInitials, handleLogout, theme, setTheme, mounted, imageError]);

    // Show loading state while authentication is being checked
    if (isLoading) {
        return (
            <div className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 w-20 h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Mobile view
    if (isMobile) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 right-4 z-50 md:hidden shadow-md bg-white dark:bg-gray-800"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent side="left" className="p-0 w-80">
                        <ScrollArea className="h-full w-full">
                            {SidebarContent}
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    // Desktop view
    return (
        <div
            className={cn(
                "flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative ",
                isCollapsed ? `w-${SIDEBAR_COLLAPSED_WIDTH}` : `w-${SIDEBAR_EXPANDED_WIDTH}`
            )}
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
        >
            {SidebarContent}
        </div>
    );
});

SidebarLender.displayName = 'SidebarLender';

export default SidebarLender;