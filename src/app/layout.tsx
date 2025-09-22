
import type { Metadata } from "next";
/* import { Inter, Righteous, Pacifico } from "next/font/google"; */
import "./globals.css";
import Script from "next/script";
import { cn } from "@/lib/utils";
import QueryProvider from "@/utils/QueryProvider";
import { ThemeProvider } from "@/lib/styles/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CosConnect - Your Cosplay Costume Marketplace",
  description: "Rent or list cosplay costumes. Connect with cosplay enthusiasts worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(
      /*   inter.variable,
        righteous.variable,
        pacifico.variable */
    )} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent form-related attributes from being added
              document.addEventListener('DOMContentLoaded', () => {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
                      mutation.target.removeAttribute('fdprocessedid');
                    }
                  });
                });
                
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['fdprocessedid'],
                  subtree: true
                });
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/*   <Script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}