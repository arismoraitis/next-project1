import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
    title: "Ticket Tracker",
    description: "Description for Ticket tracker",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="bg-slate-950 text-slate-100">
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <header className="border-b border-slate-800 px-6 py-3 flex justify-between items-center">
                    <span className="font-semibold">Ticket Tracker</span>
                </header>
                <main className="flex-1">{children}</main>
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}