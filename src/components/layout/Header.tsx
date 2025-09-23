"use client"
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { HelpCircle, LogIn, LogOut, Menu, Moon, Settings, ShoppingCart, Sun, User, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserSession, signOut } from '../../../actions/auth';
import SwitchRoleButton from "@/components/layout/UiSections/ButtonSwitch/SwitchRoleButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useGetBorrowerProfile } from "@/lib/api/borrowerApi";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            const session = await getUserSession();
            if (session?.status === "success") {
                setUser(session.user);
            }
        };
        fetchUser();
    }, []);

    const isAuthenticated = !!user;
    const userRole = user?.user_metadata?.role || null;

    // Get username from metadata, fallback to email name (before @) if username is undefined
    let username = user?.user_metadata?.username;
    if (!username || typeof username !== 'string' || username.trim() === '') {
        const email = user?.user_metadata?.email || user?.email;
        username = email ? email.split('@')[0] : 'user';
    }
    username = username.toLowerCase();

    // Fetch profile data using the username (only if authenticated)
    const { data: profileData } = useGetBorrowerProfile(isAuthenticated ? username : "");

    // Compute display name
    let displayName = null;
    if (profileData && (profileData.first_name || profileData.last_name)) {
        displayName = [
            profileData.first_name,
            profileData.middle_name,
            profileData.last_name
        ].filter(Boolean).join(' ');
    }
    if (!displayName) {
        displayName = user?.user_metadata?.name || username;
    }

    const navLinks = [
        { name: 'Community', href: '/' },
        { name: 'Market Place', href: '/marketplace' },
    ];

    const supportLinks = [
        { name: 'Help Center', href: '/help', icon: HelpCircle },
        { name: 'Contact Support', href: '/support', icon: HelpCircle },
    ];

    const handleLogout = async () => {
        await signOut();
    };
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-primary-950/90 dark:border-primary-900">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                {/* Logo */}
                <div className='flex justify-start items-center gap-8'>
                    {/* Back Button */}
                    {pathname !== "/" && (
                        <button
                            onClick={() => router.back()}
                            className="mr-2 flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                    )}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold font-heading dark:text-white">CosConnect</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium",
                                    "transition-colors duration-300",
                                    "hover:text-rose-600 dark:hover:text-rose-400"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Theme Toggle Button */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "hidden md:flex cursor-pointer",
                                "hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950",
                                "transition-colors duration-300"
                            )}
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 cursor-pointer" />
                            ) : (
                                <Moon className="h-5 w-5 cursor-pointer" />
                            )}
                        </Button>
                    )}

                    {/* User Profile Dropdown */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "hidden md:flex items-center gap-3 px-3 py-2 rounded-full",
                                        "hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950",
                                        "transition-colors duration-300 cursor-pointer"
                                    )}
                                >
                                    {/* Avatar */}
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={username} />
                                        <AvatarFallback>
                                            <User className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* User Info */}
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-sm text-foreground">
                                            {displayName}
                                        </span>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {userRole}
                                        </span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <Link href={`/profile/${username}`} className='cursor-pointer'>
                                    <DropdownMenuItem className='cursor-pointer'>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                </Link>
                                {userRole === 'lender' ? (
                                    <DropdownMenuItem>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>Manage Orders</span>
                                    </DropdownMenuItem>
                                ) : (
                                    <Link href="/my-rentals">
                                        {/* <DropdownMenuItem>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            <span>My Rentals</span>
                                        </DropdownMenuItem> */}
                                    </Link>
                                )}
                                <Link href="/settings">
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <div className="w-full flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-muted transition-colors">
                                        <SwitchRoleButton />
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="ghost"
                            className={cn(
                                "hidden md:flex",
                                "hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950",
                                "transition-colors duration-300"
                            )}
                            onClick={() => router.push('/signin')}
                        >
                            <LogIn className="h-5 w-5 mr-2" />
                            <span>Sign In</span>
                        </Button>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "md:hidden",
                                    "hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950",
                                    "transition-colors duration-300"
                                )}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] dark:bg-primary-950 dark:border-primary-900">
                            <div className="flex flex-col h-full">
                                <SheetHeader className="border-b dark:border-primary-800">
                                    <SheetTitle className="flex items-center justify-between p-4">
                                        <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                            <span className="text-xl font-bold font-heading dark:text-white">CosConnect</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Navigation Links */}
                                <nav className="flex-1 p-4 space-y-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center space-x-3 px-4 py-3 rounded-lg",
                                                "text-sm font-medium",
                                                "transition-colors duration-300",
                                                "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                "hover:text-rose-600 dark:hover:text-rose-400"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>

                                <div className='flex items-center justify-center'>
                                    <SwitchRoleButton />
                                </div>

                                {/* User Section */}
                                <div className="p-4 space-y-4 border-t dark:border-primary-800">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-semibold text-muted-foreground">Account</h3>
                                                <Link href={`/profile/${username}`}>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start space-x-3",
                                                            "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                            "hover:text-rose-600 dark:hover:text-rose-400",
                                                            "transition-colors duration-300 cursor-pointer"
                                                        )}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <User className="h-5 w-5" />
                                                        <span>Profile</span>
                                                    </Button>
                                                </Link>

                                                {userRole === 'lender' ? (
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start space-x-3",
                                                            "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                            "hover:text-rose-600 dark:hover:text-rose-400",
                                                            "transition-colors duration-300"
                                                        )}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <ShoppingCart className="h-5 w-5" />
                                                        <span>Manage Orders</span>
                                                    </Button>
                                                ) : (
                                                    <Link href="/my-rentals">
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "w-full justify-start space-x-3",
                                                                "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                                "hover:text-rose-600 dark:hover:text-rose-400",
                                                                "transition-colors duration-300"
                                                            )}
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            <ShoppingCart className="h-5 w-5" />
                                                            <span>My Rentals</span>
                                                        </Button>
                                                    </Link>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-start space-x-3",
                                                        "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                        "hover:text-rose-600 dark:hover:text-rose-400",
                                                        "transition-colors duration-300"
                                                    )}
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <LogOut className="h-5 w-5" />
                                                    <span>Logout</span>
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start space-x-3",
                                                    "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                    "hover:text-rose-600 dark:hover:text-rose-400",
                                                    "transition-colors duration-300"
                                                )}
                                                onClick={() => {
                                                    router.push('/signin');
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <LogIn className="h-5 w-5" />
                                                <span>Sign In</span>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Support Section */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">Support</h3>
                                        {supportLinks.map((link) => (
                                            <Button
                                                key={link.name}
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start space-x-3",
                                                    "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                    "hover:text-rose-600 dark:hover:text-rose-400",
                                                    "transition-colors duration-300"
                                                )}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <link.icon className="h-5 w-5" />
                                                <span>{link.name}</span>
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Theme Toggle */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">Appearance</h3>
                                        {mounted && (
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start space-x-3 cursor-pointer",
                                                    "hover:bg-rose-50 dark:hover:bg-rose-900",
                                                    "hover:text-rose-600 dark:hover:text-rose-400",
                                                    "transition-colors duration-300 cursor-pointer"
                                                )}
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            >
                                                {theme === 'dark' ? (
                                                    <>
                                                        <Sun className="h-5 w-5" />
                                                        <span>Light Mode</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Moon className="h-5 w-5" />
                                                        <span>Dark Mode</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;