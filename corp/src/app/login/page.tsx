"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("senior@example.com");
    const [password, setPassword] = useState("123456");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const ok = await login(email, password);
        if (!ok) {
            setError("Λάθος email ή password (π.χ. senior@example.com / 123456)");
            return;
        }
        router.push("/tickets");
    };

    return (
        <div className="flex items-center justify-center h-full py-10">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
                <h1 className="text-lg font-semibold text-center">Login</h1>

                <div className="space-y-1 text-xs text-slate-400">
                    <p>Senior: senior@example.com / 123456</p>
                    <p>Developer: dev1@example.com / 123456</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs text-slate-300">
                        Email
                        <input
                            type="email"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="block text-xs text-slate-300">
                        Password
                        <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>

                {error && (
                    <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-2 py-1">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium"
                >
                    Sign in
                </button>
            </form>
        </div>
    );
}
