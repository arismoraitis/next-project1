"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) router.replace("/tickets");
        else router.replace("/login");
    }, [isAuthenticated, router]);

    return (
        <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-400">Redirecting…</p>
        </div>
    );
}
