import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = { title: "Athlos | Salud y rendimiento", description: "Tu panel de salud y rendimiento.", manifest: "/manifest.json", icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" }, other: { "theme-color": "#047857" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><head><link rel="manifest" href="/manifest.json"/><meta name="theme-color" content="#047857"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/><meta name="apple-mobile-web-app-title" content="Athlos"/></head><body><AuthProvider>{children}</AuthProvider><script dangerouslySetInnerHTML={{ __html: `if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")` }}/></body></html>; }
