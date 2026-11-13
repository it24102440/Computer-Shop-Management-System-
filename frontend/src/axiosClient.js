import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URI,
    withCredentials: true, // Enable cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - auto add Session ID from tab storage
axiosClient.interceptors.request.use(
    (config) => {
        const sid = sessionStorage.getItem("sid");
        if (sid) {
            config.headers["X-Session-ID"] = sid;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 (unauthorized) → auto logout
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginPage = window.location.pathname === "/login";
        const isAuthCheck = error.config?.url?.includes("/users/me");
        
        if (error.response?.status === 401 && !isLoginPage && !isAuthCheck) {
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
