import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { AIInit } from "@/components/ai-init";

export const metadata: Metadata = { title: "Athlos | Salud y rendimiento", description: "Tu panel de salud y rendimiento.", manifest: "/manifest.json", icons: { icon: "/logo.png", apple: "/logo.png" }, other: { "theme-color": "#047857" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es" className="scroll-smooth"><head><link rel="manifest" href="/manifest.json"/><meta name="theme-color" content="#047857"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/><meta name="apple-mobile-web-app-title" content="Athlos"/></head><body className="font-sans antialiased"><AuthProvider>{children}<AIInit /></AuthProvider><script dangerouslySetInnerHTML={{ __html: `if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")` }}/></body></html>; }
