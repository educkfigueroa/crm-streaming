import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { themeScript } from "@/lib/themes";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1119" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: "CRM Streaming",
  description: "Sistema de gestión de cuentas de streaming",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CRM Streaming",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#10b981",
    "msapplication-tap-highlight": "no",
    "twitter:card": "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/gstreaming.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className="min-h-full flex flex-col font-sf overscroll-none">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
