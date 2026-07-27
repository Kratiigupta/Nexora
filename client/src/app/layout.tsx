import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexora — Smart Student Collaboration Platform",
    template: "%s | Nexora",
  },
  description:
    "Find teammates, form teams, exchange skills, and collaborate on projects. Nexora is the ultimate platform for student collaboration, team formation, and peer learning.",
  keywords: [
    "student collaboration",
    "team formation",
    "skill exchange",
    "hackathon teams",
    "project collaboration",
    "peer learning",
    "mentoring platform",
  ],
  authors: [{ name: "Nexora" }],
  openGraph: {
    title: "Nexora — Smart Student Collaboration Platform",
    description:
      "Find teammates, form teams, exchange skills, and collaborate on projects.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
