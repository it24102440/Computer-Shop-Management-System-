import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [form, setForm] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        address: "",
        city: "",
        phone: user.phone || "",
    });
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("new");
    const [saveForFuture, setSaveForFuture] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    
    // Promo Code
    const [promoInput, setPromoInput] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);

    // Card Details
    const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);

    const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        if (stored.length === 0) {
            toast.error("Your cart is empty!");
            navigate("/products");
        }
        setCart(stored);
        fetchSavedAddresses();
    }, []);

    async function fetchSavedAddresses() {
        if (!sessionStorage.getItem("sid")) return;

        try {
            setLoadingAddresses(true);
            const res = await axiosClient.get("/users/addresses");
            setSavedAddresses(res.data);
            if (res.data.length > 0) {
                const def = res.data.find(a => a.isDefault) || res.data[0];
                handlePickAddress(def);
            }
        } catch (err) {
            console.error("Failed to fetch addresses");
        } finally {
            setLoadingAddresses(false);
        }
    }

    function handlePickAddress(addr) {
        if (addr === "new") {
            setSelectedAddressId("new");
            setForm({ firstName: user.firstName || "", lastName: user.lastName || "", address: "", city: "", phone: user.phone || "" });
        } else {
            setSelectedAddressId(addr._id);
            setForm({ firstName: addr.firstName, lastName: addr.lastName, address: addr.address, city: addr.city, phone: addr.phone });
        }
    }

    const [hasSecondaryAddress, setHasSecondaryAddress] = useState(false);
    const [secondaryForm, setSecondaryForm] = useState({
        address: "",
        city: "",
        phone: "",
        note: ""
    });

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= 20000 ? 0 : 500; // 🚚 Free shipping over 20k
    
    // Calculate total with discount
    useEffect(() => {
        if (promoCode === "NEW10") {
            setDiscount((subtotal + shipping) * 0.10); // 10% discount
        } else {
            setDiscount(0);
        }
    }, [promoCode, subtotal, shipping]);

    const total = subtotal + shipping - discount;

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSecondaryChange(e) {
        setSecondaryForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    // Step navigation validation
    const goToStep2 = () => {
        if (!form.firstName || !form.lastName || !form.address || !form.city || !form.phone) {
            toast.error("Please fill all shipping details!");
            return;
        }
        if (hasSecondaryAddress && (!secondaryForm.address || !secondaryForm.city || !secondaryForm.phone)) {
            toast.error("Please fill all secondary address fields!");
            return;
        }
        setStep(2);
        window.scrollTo(0, 0);
    };

    const goToStep3 = () => {
        setStep(3);
        window.scrollTo(0, 0);
    };

    async function handlePlaceOrder() {
        if (!sessionStorage.getItem("sid")) {
            toast.error("Please login to place an order!");
            navigate("/login");
            return;
        }

        if (paymentMethod === "Online Payment") {
            if (card.number.length < 16 || !card.expiry || card.cvv.length < 3) {
                toast.error("Please enter valid card details!");
                return;
            }
            // Send OTP
            try {
                setSendingOtp(true);
                await axiosClient.post("/orders/send-otp");
                setShowOtp(true);
                toast.success("OTP sent to your email!");
            } catch (err) {
                toast.error("Failed to send OTP. Please try again.");
            } finally {
                setSendingOtp(false);
            }
            return;
        }

        // Cash on delivery
        submitFinalOrder(null);
    }

    async function submitFinalOrder(otpCode) {
        try {
            setLoading(true);
            const items = cart.map(item => ({
                productId: item.productid,
                name: item.name,
                price: item.price,
                quantity: item.qty,
                image: item.image?.[0] || "",
            }));

            const payload = {
                items,
                shippingAddress: form,
                secondaryAddress: hasSecondaryAddress ? secondaryForm : null,
                paymentMethod,
                promoCode
            };
            if (otpCode) payload.otp = otpCode;

            const res = await axiosClient.post("/orders", payload);

            // Save for future if checked
            if (selectedAddressId === "new" && saveForFuture) {
                await axiosClient.post("/users/addresses", { ...form, label: "Saved Address" });
            }

            // Clear cart & close everything
            localStorage.removeItem("cart");
            setShowOtp(false);
            setOtp("");

            toast.success("🎉 Order placed successfully!");
            navigate("/my-orders");
        } catch (err) {
            const msg = err?.response?.data?.message || err.message;
            toast.error("Order failed: " + msg);
        } finally {
            setLoading(false);
        }
    }

    function applyPromo() {
        if (promoInput.trim().toUpperCase() === "NEW10") {
            setPromoCode("NEW10");
            toast.success("Promo code applied! 10% Off");
        } else {
            toast.error("Invalid promo code");
            setPromoCode("");
            setDiscount(0);
        }
    }

    return (
        <div className="min-h-screen bg-primary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <div className="hidden md:flex gap-4 text-[10px] md:text-sm font-black uppercase tracking-wider">
                    <span className={`${step >= 1 ? 'text-accent' : 'text-primary/40'}`}>1. Shipping</span>
                    <span className="text-primary/20">/</span>
                    <span className={`${step >= 2 ? 'text-accent' : 'text-primary/40'}`}>2. Review</span>
                    <span className="text-primary/20">/</span>
                    <span className={`${step === 3 ? 'text-accent' : 'text-primary/40'}`}>3. Payment</span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">
                
                {/* Visual Step Indicator */}
                <div className="flex justify-between items-center mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary/10 -translate-y-1/2 z-0"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>
                    
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${step >= s ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/40' : 'bg-white text-secondary/30 border-4 border-secondary/10'}`}>
                            {step > s ? '✓' : s}
                        </div>
                    ))}
                </div>

                <div className="space-y-8">

                    {/* ──── STEP 1: SHIPPING DETAILS ──── */}
                    {step === 1 && (
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-secondary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-3">
                                <span className="p-2 bg-accent/10 rounded-xl text-xl">📦</span> 
                                Shipping Details
                            </h2>
                            
                            {/* Saved Addresses List */}
                            {loadingAddresses ? (
                                <div className="h-20 flex items-center justify-center animate-pulse">
                                    <p className="text-xs font-black text-secondary/30 uppercase">Loading saved addresses...</p>
                                </div>
                            ) : savedAddresses.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-secondary/10">
                                    {savedAddresses.map(a => (
                                        <div key={a._id} 
                                            onClick={() => handlePickAddress(a)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === a._id ? 'border-accent bg-accent/5' : 'border-secondary/10 hover:border-accent/30'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] font-black uppercase text-accent tracking-widest">{a.label}</p>
                                                {selectedAddressId === a._id && <span className="text-accent animate-ping text-[8px]">●</span>}
                                            </div>
                                            <p className="font-black text-secondary">{a.firstName} {a.lastName}</p>
                                            <p className="text-sm text-secondary/40">{a.address}, {a.city}</p>
                                            <p className="text-sm text-secondary/40">{a.phone}</p>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => handlePickAddress("new")}
                                        className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${selectedAddressId === 'new' ? 'border-accent bg-accent/5' : 'border-secondary/10 hover:border-accent/40'}`}>
                                        <span className="text-2xl mb-1">+</span>
                                        <p className="text-xs font-black uppercase text-secondary/40">New Address</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {[
                                    { name: "firstName", label: "First Name", placeholder: "e.g. Salinda" },
                                    { name: "lastName", label: "Last Name", placeholder: "e.g. Herath" },
                                    { name: "address", label: "Delivery Address", placeholder: "No, Street, Apartment...", full: true },
                                    { name: "city", label: "City", placeholder: "e.g. Colombo" },
                                    { name: "phone", label: "Phone Number", placeholder: "07xxxxxxxx" },
                                ].map(f => (
                                    <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                                        <label className="block text-xs font-black text-secondary/40 uppercase tracking-widest mb-2">{f.label}</label>
                                        <input
                                            name={f.name}
                                            value={form[f.name]}
                                            onChange={handleChange}
                                            disabled={selectedAddressId !== "new"}
                                            placeholder={f.placeholder}
                                            className={`w-full h-14 border-2 border-secondary/10 rounded-2xl px-5 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent text-secondary font-bold transition-all ${selectedAddressId !== 'new' ? 'bg-secondary/5 opacity-60' : 'bg-primary/30'}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {selectedAddressId === "new" && (
                                <label className="flex items-center gap-3 mt-6 cursor-pointer group">
                                    <input type="checkbox" checked={saveForFuture} onChange={e => setSaveForFuture(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-secondary/20 accent-accent" />
                                    <span className="text-xs font-black uppercase text-secondary/40 tracking-wider group-hover:text-secondary transition-colors">Save this address for future use</span>
                                </label>
                            )}

                            {/* Secondary Address Toggle */}
                            <div className="mt-8 pt-8 border-t border-secondary/10">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={hasSecondaryAddress} 
                                        onChange={e => setHasSecondaryAddress(e.target.checked)} 
                                        className="w-5 h-5 rounded-lg border-2 border-secondary/20 accent-accent" 
                                    />
                                    <div>
                                        <p className="text-xs font-black uppercase text-secondary tracking-wider">Add a Secondary/Alternative Address?</p>
                                        <p className="text-[10px] text-secondary/40 font-bold">Optional: Useful for alternative delivery points or notes</p>
                                    </div>
                                </label>

                                {hasSecondaryAddress && (
                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 bg-primary/20 rounded-3xl border-2 border-accent/10 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Alternative Address</label>
                                            <input
                                                name="address"
                                                value={secondaryForm.address}
                                                onChange={handleSecondaryChange}
                                                placeholder="Secondary Street name, building..."
                                                className="w-full h-12 bg-white border-2 border-secondary/10 rounded-xl px-4 focus:outline-none focus:border-accent text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">City</label>
                                            <input
                                                name="city"
                                                value={secondaryForm.city}
                                                onChange={handleSecondaryChange}
                                                placeholder="City"
                                                className="w-full h-12 bg-white border-2 border-secondary/10 rounded-xl px-4 focus:outline-none focus:border-accent text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Phone</label>
                                            <input
                                                name="phone"
                                                value={secondaryForm.phone}
                                                onChange={handleSecondaryChange}
                                                placeholder="Alternative Contact"
                                                className="w-full h-12 bg-white border-2 border-secondary/10 rounded-xl px-4 focus:outline-none focus:border-accent text-sm font-bold"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Delivery Note (Optional)</label>
                                            <textarea
                                                name="note"
                                                value={secondaryForm.note}
                                                onChange={handleSecondaryChange}
                                                placeholder="e.g. Leave at the front gate, red door..."
                                                className="w-full h-20 bg-white border-2 border-secondary/10 rounded-xl p-4 focus:outline-none focus:border-accent text-sm font-bold resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button onClick={goToStep2} className="px-10 h-14 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:translate-x-2 transition-all shadow-lg shadow-accent/30 flex items-center gap-3 group">
                                    Next: Review Order
                                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ──── STEP 2: ORDER REVIEW ──── */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-secondary/5">
                                <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <span className="p-2 bg-green-500/10 rounded-xl text-xl">🏷️</span> 
                                    Review Your Order
                                </h2>

                                {/* Items List */}
                                <div className="space-y-4 mb-8">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex items-center gap-5 p-4 bg-primary/20 rounded-2xl border border-secondary/5">
                                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm p-2">
                                                {item.image?.[0] ? (
                                                    <img src={item.image[0]} alt={item.name} className="w-full h-full object-contain" />
                                                ) : <span className="text-2xl">💻</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-secondary line-clamp-1">{item.name}</p>
                                                <p className="text-sm font-bold text-accent">Rs. {item.price.toLocaleString()} × {item.qty}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-secondary">Rs. {(item.price * item.qty).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Section */}
                                <div className="flex gap-3 mb-8 max-w-sm">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="PROMO CODE (e.g. NEW10)"
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                            disabled={discount > 0}
                                            className="w-full h-12 border-2 border-secondary/10 rounded-xl px-4 text-sm font-black uppercase disabled:bg-secondary/5 focus:outline-none focus:border-accent"
                                        />
                                        {discount > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>}
                                    </div>
                                    {discount > 0 ? (
                                        <button onClick={() => { setPromoCode(""); setDiscount(0); setPromoInput(""); }} className="px-4 bg-red-100 text-red-600 rounded-xl border border-red-200 text-xs font-black uppercase tracking-widest hover:bg-red-200 transition-colors">Remove</button>
                                    ) : (
                                        <button onClick={applyPromo} className="px-6 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-secondary/80 transition-all">Apply</button>
                                    )}
                                </div>

                                <div className="space-y-4 border-t border-secondary/10 pt-8">
                                    <div className="flex justify-between items-center text-secondary/40 font-black uppercase tracking-widest text-xs">
                                        <span>Subtotal</span>
                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-black uppercase tracking-widest text-xs">
                                        <span className="text-secondary/40">Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-pulse">FREE 🚚</span>
                                        ) : (
                                            <span className="text-secondary">Rs. {shipping.toLocaleString()}</span>
                                        )}
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-black uppercase tracking-widest text-xs bg-green-50 p-3 rounded-2xl border border-green-100">
                                            <span>🎁 Promo Discount (10% OFF)</span>
                                            <span>- Rs. {discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-secondary/10">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Final Amount</p>
                                            <p className="text-4xl font-black text-secondary">Rs.{total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Summary for review */}
                            <div className="bg-white rounded-3xl p-6 shadow-lg border border-secondary/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-xl">📍</div>
                                    <div>
                                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Shipping to</p>
                                        <p className="font-black text-secondary">{form.firstName} {form.lastName}</p>
                                        <p className="text-xs text-secondary/60 truncate max-w-[200px]">{form.address}, {form.city}</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(1)} className="text-xs font-black uppercase text-accent hover:underline">Change</button>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 h-14 bg-primary/40 text-secondary font-black uppercase tracking-widest rounded-2xl border-2 border-secondary/5 hover:bg-primary/60 transition-all">
                                    Back
                                </button>
                                <button onClick={goToStep3} className="flex-[2] h-14 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/30">
                                    Next: Payment Method
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ──── STEP 3: PAYMENT METHOD ──── */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-secondary/5">
                                <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <span className="p-2 bg-blue-500/10 rounded-xl text-xl">💳</span> 
                                    Choose Payment Method
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "Cash on Delivery", icon: "💵", label: "Cash on Delivery", desc: "Pay when package arrives" },
                                        { id: "Online Payment", icon: "💳", label: "Online Payment", desc: "Secure Card / Bank Transfer" }
                                    ].map(method => (
                                        <label key={method.id}
                                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                                                    ? "border-accent bg-accent/5 ring-4 ring-accent/5"
                                                    : "border-secondary/5 hover:border-accent/40 bg-primary/20"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={() => setPaymentMethod(method.id)}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center text-center">
                                                <span className="text-4xl mb-4 p-4 bg-white rounded-2xl shadow-sm">{method.icon}</span>
                                                <p className="font-black text-secondary tracking-tight">{method.label}</p>
                                                <p className="text-xs text-secondary/40 font-bold uppercase tracking-wider mt-1">{method.desc}</p>
                                                <div className={`mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-accent bg-accent' : 'border-secondary/20'}`}>
                                                    {paymentMethod === method.id && <span className="text-white text-[10px]">✓</span>}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {paymentMethod === "Online Payment" && (
                                    <div className="mt-8 p-8 bg-primary/30 rounded-3xl border-2 border-accent/10 animate-in zoom-in-95 duration-300">
                                        <p className="font-black text-secondary mb-6 flex items-center gap-2">
                                            <span className="text-accent">🔒</span> Card Information
                                        </p>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Card Number</label>
                                                <input
                                                    type="text"
                                                    maxLength="16"
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    value={card.number}
                                                    onChange={e => setCard({ ...card, number: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full h-14 border-2 border-secondary/10 rounded-2xl px-5 focus:outline-none focus:border-accent text-secondary font-black tracking-[0.2em]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        maxLength="5"
                                                        placeholder="MM/YY"
                                                        value={card.expiry}
                                                        onChange={e => setCard({ ...card, expiry: e.target.value })}
                                                        className="w-full h-14 border-2 border-secondary/10 rounded-2xl px-5 focus:outline-none focus:border-accent text-secondary font-black"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">CVV</label>
                                                    <input
                                                        type="password"
                                                        maxLength="3"
                                                        placeholder="***"
                                                        value={card.cvv}
                                                        onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                                                        className="w-full h-14 border-2 border-secondary/10 rounded-2xl px-5 focus:outline-none focus:border-accent text-secondary font-black text-center tracking-[0.5em]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                                            <span className="w-10 h-6 border rounded flex items-center justify-center bg-white">VISA</span>
                                            <span className="w-10 h-6 border rounded flex items-center justify-center bg-white">MC</span>
                                            <span className="ml-auto text-green-500 flex items-center gap-1">
                                                <span className="text-base">🛡️</span> Secure Transaction
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Final Total Summary Card */}
                            <div className="bg-secondary rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">Items: {cart.length}</p>
                                    <p className="text-3xl font-black">Rs. {total.toLocaleString()}</p>
                                    <p className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-wider">Includes taxes and shipping</p>
                                </div>
                                <div className="flex w-full md:w-auto gap-3">
                                    <button onClick={() => setStep(2)} className="flex-1 md:px-8 h-14 bg-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading || sendingOtp}
                                        className="flex-[2] md:px-12 h-14 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? "Processing..." : (
                                            <>
                                                {paymentMethod === "Online Payment" ? "Secure Pay 🔒" : "Place Order ✅"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] px-10">
                                By placing an order, you agree to TechShop's <span className="text-accent underline cursor-pointer">Terms of Service</span> and <span className="text-accent underline cursor-pointer">Refund Policy</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* OTP Modal */}
            {showOtp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md text-center transform transition-all animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-accent/10 text-accent rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🛡️</div>
                        <h2 className="text-2xl font-black text-secondary mb-3">Verification Required</h2>
                        <p className="text-sm text-secondary/40 font-bold mb-8 leading-relaxed">
                            A 6-digit security code was sent to <span className="text-secondary font-black">{user.email}</span>. Please enter it to authorize your payment.
                        </p>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full h-16 border-4 border-primary bg-primary/30 rounded-3xl px-4 text-center font-black text-3xl tracking-[0.5em] focus:outline-none focus:border-accent focus:ring-8 focus:ring-accent/10 transition-all mb-8 shadow-sm"
                        />
                        <div className="flex flex-col gap-3">
                            <button onClick={() => submitFinalOrder(otp)} disabled={otp.length < 6 || loading} className="w-full h-14 text-white font-black uppercase tracking-widest bg-accent rounded-2xl hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/30 disabled:opacity-50">
                                {loading ? "Verifying..." : "Confirm & Pay Now"}
                            </button>
                            <button onClick={() => { setShowOtp(false); setOtp(""); }} className="w-full h-14 text-secondary/40 font-black uppercase tracking-widest hover:text-secondary rounded-2xl transition-all">
                                Cancel Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
