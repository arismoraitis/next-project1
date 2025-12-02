"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from "react";

import type { User } from "@/types/ticket";

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    users: User[];
};

//
const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    login: async () => false,
    logout: () => {},
    users: [],
});

const MOCK_USERS: (User & { password: string })[] = [
    {
        id: 1,
        name: "Senior Sofia",
        email: "senior@example.com",
        role: "SENIOR",
        password: "123456",
    },
    {
        id: 2,
        name: "Dev Dimitris",
        email: "dev1@example.com",
        role: "DEVELOPER",
        password: "123456",
    },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem("ticket-app-user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const login = async (email: string, password: string) => {
        const found = MOCK_USERS.find(
            (u) => u.email === email && u.password === password
        );
        if (!found) return false;

        const safeUser: User = {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
        };
        setUser(safeUser);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("ticket-app-user", JSON.stringify(safeUser));
        }

        console.log("LOGGED IN AS:", safeUser); // εδώ θα δεις role = "SENIOR" ή "DEVELOPER"

        return true;
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("ticket-app-user");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                users: MOCK_USERS,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
