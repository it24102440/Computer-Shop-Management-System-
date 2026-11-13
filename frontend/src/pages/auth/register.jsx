import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("customer");
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function Register() {
        if (!firstName || !lastName || !email || !password || !phone) {
            toast.error("Please fill in all fields!");
            return;
        }
        if (role === "supplier" && !companyName) {
            toast.error("Company Name is required for Suppliers!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }

        try {
            setLoading(true);
            const endpoint = role === "customer" ? "/users/register" : "/users/register-staff";
            const payload = role === "customer"
                ? { firstName, lastName, email, password, phone }
                : { firstName, lastName, email, password, role, companyName, contactNumber: phone };

            const response = await axiosClient.post(endpoint, payload);

            console.log(response.data);
            if (role === "customer") {
                toast.success("Account created successfully! Please log in.");
            } else {
                alert("Registration Successful! Please wait for Admin approval. You will be able to log in once your account is confirmed.");
                toast.success("Account created! Waiting for Admin approval.");
            }
            navigate("/login");
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "Registration failed!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-screen h-screen bg-[url('/newbgphoto.jpg')] bg-cover bg-no-repeat flex">
            {/* Left side - empty space */}
            <div className="w-[50%] h-full" />

            {/* Right side - Register Form */}
            <div className="w-[50%] h-full flex items-center justify-end pr-25">
                <div className="backdrop-blur-md w-[450px] shadow-2xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <h1 className="text-4xl font-bold text-center mt-6 mb-2 text-secondary">
                        Create Account
                    </h1>
                    <p className="text-center text-secondary/70 mb-4 text-sm">
                        Join us and start shopping today
                    </p>

                    {/* Form Body */}
                    <div className="backdrop-blur-xl flex flex-col items-center pb-6 px-4 gap-2.5">

                        {/* Role Selector */}
                        <div className="flex gap-2 w-[80%] bg-white/40 p-1 rounded-xl mb-1">
                            {["customer", "supplier", "inventoryManager"].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${role === r ? "bg-accent text-white shadow-md" : "text-secondary/70 hover:bg-white/50"
                                        }`}
                                >
                                    {r === "customer" ? "Customer" : r === "supplier" ? "Supplier" : "Inv. Manager"}
                                </button>
                            ))}
                        </div>

                        {/* First Name + Last Name row */}
                        <div className="flex gap-3 w-[80%]">
                            <input
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-1/2 h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                            />
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-1/2 h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                            />
                        </div>

                        {/* Email */}
                        <input
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                        />

                        {/* Phone */}
                        <input
                            id="phone"
                            type="tel"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                        />

                        {/* Supplier Specific Field */}
                        {role === "supplier" && (
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-[80%] h-12 rounded-lg border-2 border-yellow-400 focus:ring-yellow-400 bg-yellow-50 px-3 focus:outline-none focus:ring-2 text-secondary placeholder-secondary/60 transition-all text-sm"
                            />
                        )}

                        {/* Password */}
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                        />

                        {/* Confirm Password */}
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-[80%] h-12 rounded-lg border-2 border-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white/30 text-secondary placeholder-secondary/60 transition-all text-sm"
                        />

                        {/* Register Button */}
                        <button
                            id="registerBtn"
                            onClick={Register}
                            disabled={loading}
                            className="w-[80%] h-12 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {/* Already have account */}
                        <p className="mt-2 text-secondary/80 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
