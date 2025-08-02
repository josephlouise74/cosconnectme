"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/styles/theme';
import { Facebook, Instagram, Mail, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Blog', href: '/blog' },
            { name: 'Press', href: '/press' },
        ],
        support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'FAQs', href: '/faqs' },
            { name: 'Shipping', href: '/shipping' },
        ],
        legal: [
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'Accessibility', href: '/accessibility' },
        ],
    };

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
        { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
        { name: 'Youtube', icon: Youtube, href: 'https://youtube.com' },
    ];

    return (
        <footer className={cn(
            "bg-background border-t w-full dark:bg-primary-950 dark:border-primary-900",
            "transition-colors duration-300"
        )}>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <Card className="border-none shadow-none bg-transparent dark:bg-transparent">
                        <CardHeader className="p-0">
                            <h3 className="text-lg font-bold font-heading dark:text-white">CosConnect</h3>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <p className="text-sm text-muted-foreground dark:text-primary-200">
                                Your premier destination for costume rentals. Find the perfect outfit for any occasion.
                            </p>
                            <div className="flex space-x-4">
                                {socialLinks.map((social) => (
                                    <Link
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "text-muted-foreground dark:text-primary-300",
                                            "hover:text-rose-600 dark:hover:text-rose-400",
                                            "transition-colors duration-300"
                                        )}
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card className="border-none shadow-none bg-transparent dark:bg-transparent">
                        <CardHeader className="p-0">
                            <h3 className="text-sm font-semibold dark:text-white">Company</h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "text-sm text-muted-foreground dark:text-primary-300",
                                                "hover:text-rose-600 dark:hover:text-rose-400",
                                                "transition-colors duration-300"
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card className="border-none shadow-none bg-transparent dark:bg-transparent">
                        <CardHeader className="p-0">
                            <h3 className="text-sm font-semibold dark:text-white">Support</h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="space-y-3">
                                {footerLinks.support.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "text-sm text-muted-foreground dark:text-primary-300",
                                                "hover:text-rose-600 dark:hover:text-rose-400",
                                                "transition-colors duration-300"
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Newsletter */}
                    <Card className="border-none shadow-none bg-transparent dark:bg-transparent">
                        <CardHeader className="p-0">
                            <h3 className="text-sm font-semibold dark:text-white">Stay Updated</h3>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <p className="text-sm text-muted-foreground dark:text-primary-200">
                                Subscribe to our newsletter for the latest costumes and exclusive offers.
                            </p>
                            <div className="flex space-x-2">
                                <Input
                                    type="email"
                                    placeholder="Your email"
                                    className={cn(
                                        "flex-1",
                                        "dark:bg-primary-900 dark:border-primary-800",
                                        "focus:border-rose-600 focus:ring-rose-600",
                                        "transition-colors duration-300"
                                    )}
                                />
                                <Button
                                    size="icon"
                                    className={cn(
                                        "bg-black hover:bg-rose-600",
                                        "dark:bg-white dark:hover:bg-rose-600",
                                        "text-white dark:text-black",
                                        "hover:text-white dark:hover:text-white",
                                        "transition-colors duration-300"
                                    )}
                                >
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t dark:border-primary-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-muted-foreground dark:text-primary-300">
                            © {currentYear} CosConnect. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            {footerLinks.legal.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "text-sm text-muted-foreground dark:text-primary-300",
                                        "hover:text-rose-600 dark:hover:text-rose-400",
                                        "transition-colors duration-300"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;