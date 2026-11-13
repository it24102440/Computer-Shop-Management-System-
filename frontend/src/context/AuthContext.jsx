import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Read Session ID (SID) from tab-specific sessionStorage
            const sid = sessionStorage.getItem("sid");
            const res = await axiosClient.get("/users/me", {
                headers: sid ? { "X-Session-ID": sid } : {}
            });
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, sid) => {
        setUser(userData);
        // Save SID to tab-specific storage so this tab knows which cookie to use
        sessionStorage.setItem("sid", sid);
        sessionStorage.setItem("currentRole", userData.role);
    };

    const logout = async () => {
        try {
            const sid = sessionStorage.getItem("sid");
            await axiosClient.post("/users/logout", { sid });
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            setUser(null);
            sessionStorage.removeItem("sid");
            sessionStorage.removeItem("currentRole");
            localStorage.clear(); 
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
