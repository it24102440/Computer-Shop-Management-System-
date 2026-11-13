import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    async function Login() {
        if (!email || !password) {
            toast.error("Please enter email and password!");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosClient.post("/users/login", { email, password });
            const { role, user, sid } = response.data;

            // State update via context (cookies handle the token using SID)
            login(user, sid);

            toast.success("Login Successful!");

            // Role-based redirect
            const roleRedirects = {
                admin: "/admin",
                supplier: "/supplier",
                inventoryManager: "/inventory",
                productManager: "/admin",
                customer: "/"
            };

            navigate(roleRedirects[role] || "/");

        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "Login Failed!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-screen h-screen bg-[url('/newbgphoto.jpg')] bg-cover bg-no-repeat flex">
            {/* Left side */}
            <div className="w-[50%] h-full" />

            {/* Right side - Login Form */}
            <div className="w-[50%] h-full flex items-center justify-end pr-25">
                <div className="backdrop-blur-md w-[450px] h-[600px] shadow-2xl rounded-2xl">
                    <h1 className="text-4xl font-bold text-center mt-10">Login</h1>
                    <div className="backdrop-blur-xl w-[450px] h-[600px] shadow-2xl rounded-b-lg flex flex-col justify-center items-center gap-4">

                        {/* Email */}
                        <input
                            id="loginEmail"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Password */}
                        <input
                            id="loginPassword"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <p className="text-sm">
                            Forgot password?{" "}
                            <a href="/forgot-password" value={email} className="text-blue-500 hover:underline">
                                Reset Password
                            </a>
                        </p>

                        {/* Login Button */}
                        <button
                            id="loginBtn"
                            onClick={Login}
                            disabled={loading}
                            className="w-[80%] h-12 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {/* Google Login */}
                        <button
                            type="button"
                            className="w-[80%] h-12 text-white rounded-lg border border-accent transition-colors duration-300 font-bold hover:bg-accent/20"
                        >
                            Login with Google
                        </button>

                        <p>
                            Do not have an account?{" "}
                            <Link to="/register" className="text-blue-500 hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
