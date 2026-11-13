import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaEdit } from "react-icons/fa";

// ── Star Rating Component ──
function Stars({ rating, size = "text-base", interactive = false, onRate }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className={`flex gap-0.5 ${size}`}>
            {[1, 2, 3, 4, 5].map(s => (
                <span
                    key={s}
                    onClick={() => interactive && onRate?.(s)}
                    onMouseEnter={() => interactive && setHovered(s)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={interactive ? "cursor-pointer select-none transition-transform hover:scale-125" : ""}
                >
                    {s <= (interactive ? (hovered || rating) : rating) ? "⭐" : "☆"}
                </span>
            ))}
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [showQR, setShowQR] = useState(false);
    const qrRef = useRef();

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [myRating, setMyRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [eligibility, setEligibility] = useState({ canReview: false, hasDelivered: false, alreadyReviewed: false });
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const { user: currentUser } = useAuth();

    useEffect(() => {
        axiosClient.get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => toast.error("Product not found"))
            .finally(() => setLoading(false));
    }, [id]);

    // Fetch reviews and eligibility when product loads
    useEffect(() => {
        if (!product?.productid) return;
        fetchReviews();
        checkEligibility();
    }, [product]);

    function checkEligibility() {
        if (!sessionStorage.getItem("sid")) {
            setCheckingEligibility(false);
            return;
        }
        axiosClient.get(`/reviews/eligibility/${product.productid}`)
            .then(res => setEligibility(res.data))
            .catch(() => { })
            .finally(() => setCheckingEligibility(false));
    }

    function fetchReviews() {
        axiosClient.get(`/reviews/${product.productid}`)
            .then(res => {
                setReviews(res.data.reviews || []);
                setAvgRating(res.data.averageRating || 0);
            })
            .catch(() => { });
    }

    async function submitReview() {
        if (!sessionStorage.getItem("sid")) {
            toast.error("Please login to write a review!");
            navigate("/login");
            return;
        }
        if (!reviewText.trim()) {
            toast.error("Please write a comment!");
            return;
        }
        try {
            setSubmitting(true);
            await axiosClient.post("/reviews", {
                productId: product.productid,
                rating: myRating,
                comment: reviewText.trim(),
            });
            toast.success("Review submitted! ⭐");
            setReviewText("");
            setMyRating(5);
            fetchReviews();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteReview(reviewId) {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await axiosClient.delete(`/reviews/${reviewId}`);
            toast.success("Review deleted!");
            fetchReviews();
            checkEligibility();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }
    }

    async function handleUpdateReview() {
        if (!editComment.trim()) return toast.error("Comment cannot be empty");
        try {
            setSubmitting(true);
            await axiosClient.put(`/reviews/${editingReviewId}`, {
                rating: editRating,
                comment: editComment.trim()
            });
            toast.success("Review updated!");
            setEditingReviewId(null);
            fetchReviews();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    }

    function addToCart() {
        if (!product) return;
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(i => i._id === product._id);
        if (existing) { existing.qty += qty; }
        else { cart.push({ ...product, qty }); }
        localStorage.setItem("cart", JSON.stringify(cart));
        toast.success(`${product.name} added to cart! 🛒`);
        navigate("/cart"); // Auto redirect to cart
    }

    function buyNow() { addToCart(); navigate("/cart"); }

    function downloadQR() {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) return;
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${product.productid}-qr.svg`; a.click();
        URL.revokeObjectURL(url);
        toast.success("QR downloaded!");
    }

    if (loading) return (
        <div className="min-h-screen bg-primary flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-secondary/40">
            <p className="text-6xl mb-4">😕</p>
            <p className="text-xl font-semibold">Product not found</p>
            <Link to="/products" className="mt-4 text-accent hover:underline">← Back to Products</Link>
        </div>
    );

    const images = product.image?.length > 0 ? product.image : [null];
    const discount = product.labelledprice > product.price
        ? Math.round((1 - product.price / product.labelledprice) * 100) : 0;

    const qrData = JSON.stringify({
        id: product.productid,
        name: product.name,
        brand: product.brand,
        model: product.model || "",
        category: product.category,
        price: `Rs. ${product.price?.toLocaleString()}`,
        stock: product.stock,
        url: `${window.location.origin}/products/${product._id}`,
    });

    return (
        <div className="min-h-screen bg-primary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/products" className="text-primary/80 hover:text-accent text-sm font-medium">← Products</Link>
                    <Link to="/cart" className="text-primary/80 hover:text-accent text-sm font-medium">🛒 Cart</Link>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-6 py-4">
                <p className="text-secondary/40 text-sm">
                    <Link to="/" className="hover:text-accent">Home</Link> {" / "}
                    <Link to="/products" className="hover:text-accent">Products</Link> {" / "}
                    <span className="text-secondary">{product.name}</span>
                </p>
            </div>

            {/* Main Product + Info */}
            <div className="max-w-6xl mx-auto px-6 pb-10">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* ── Left: Images + QR ── */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl border border-secondary/10 h-96 flex items-center justify-center overflow-hidden mb-4">
                            {images[mainImage] ? (
                                <img src={images[mainImage]} alt={product.name}
                                    className="h-full w-full object-contain p-6"
                                    onError={e => { e.target.style.display = "none"; }} />
                            ) : <span className="text-9xl">💻</span>}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 flex-wrap mb-4">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setMainImage(i)}
                                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-white transition-all ${mainImage === i ? "border-accent shadow-lg" : "border-secondary/10 hover:border-accent/50"}`}>
                                        {img ? <img src={img} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-2xl">💻</span>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Product QR Code Hidden - Re-enable by removing 'false &&' */}
                        {false && (
                            <div className="bg-white rounded-2xl border border-secondary/10 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-secondary text-sm">📱 Product QR Code</p>
                                        <p className="text-secondary/40 text-xs">Scan to view details</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowQR(v => !v)}
                                            className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-xl hover:bg-accent hover:text-white transition-all">
                                            {showQR ? "Hide" : "Show QR"}
                                        </button>
                                        {showQR && (
                                            <button onClick={downloadQR}
                                                className="px-3 py-1.5 bg-secondary text-primary text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all">
                                                ⬇ Download
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showQR && (
                                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-secondary/10">
                                        <div ref={qrRef} className="p-4 bg-white rounded-xl border-2 border-secondary/10">
                                            <QRCode value={qrData} size={170} bgColor="#ffffff" fgColor="#01303f" level="M" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-secondary text-sm">{product.name}</p>
                                            <p className="text-accent font-extrabold">Rs. {product.price?.toLocaleString()}</p>
                                            <p className="text-secondary/40 text-xs mt-1">ID: {product.productid}</p>
                                        </div>
                                        <div className="w-full bg-secondary/5 rounded-xl p-3 text-xs space-y-1.5">
                                            {[
                                                { label: "Product", value: product.name },
                                                { label: "Brand", value: product.brand },
                                                { label: "Category", value: product.category },
                                                { label: "Price", value: `Rs. ${product.price?.toLocaleString()}` },
                                                { label: "Stock", value: `${product.stock} units` },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between">
                                                    <span className="text-secondary/50">{label}</span>
                                                    <span className="font-bold text-secondary">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Product Info ── */}
                    <div className="flex-1 space-y-5">
                        <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">{product.brand}</span>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary/60 text-xs font-bold rounded-full">{product.category}</span>
                        </div>

                        <h1 className="text-2xl font-extrabold text-secondary leading-tight">{product.name}</h1>

                        {/* Rating summary */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Stars rating={Math.round(avgRating)} />
                                <span className="font-bold text-secondary">{avgRating.toFixed(1)}</span>
                                <span className="text-secondary/40 text-sm">({reviews.length} reviews)</span>
                            </div>
                        )}

                        {product.model && (
                            <p className="text-secondary/40 text-sm">Model: <span className="font-semibold">{product.model}</span></p>
                        )}

                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-extrabold text-accent">Rs. {product.price?.toLocaleString()}</p>
                            {discount > 0 && (
                                <>
                                    <p className="text-secondary/30 line-through text-lg">Rs. {product.labelledprice?.toLocaleString()}</p>
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">-{discount}%</span>
                                </>
                            )}
                        </div>

                        <div className={`flex items-center gap-2 font-semibold text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : "❌ Out of Stock"}
                        </div>

                        {product.stock > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <p className="text-sm font-bold text-secondary">Qty:</p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="w-9 h-9 rounded-xl bg-secondary/10 hover:bg-accent hover:text-white font-bold transition-colors flex items-center justify-center">−</button>
                                        <span className="w-10 text-center font-bold text-secondary text-lg">{qty}</span>
                                        <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                            className="w-9 h-9 rounded-xl bg-secondary/10 hover:bg-accent hover:text-white font-bold transition-colors flex items-center justify-center">+</button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={addToCart}
                                        className="flex-1 h-12 border-2 border-accent text-accent rounded-xl font-bold hover:bg-accent hover:text-white transition-all text-sm">
                                        🛒 Add to Cart
                                    </button>
                                    <button onClick={buyNow}
                                        className="flex-1 h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors text-sm">
                                        ⚡ Buy Now
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-secondary/10" />

                        <div>
                            <p className="text-sm font-bold text-secondary mb-2">Description</p>
                            <p className="text-secondary/60 text-sm leading-relaxed">{product.description || "No description available."}</p>
                        </div>

                        {product.altnames?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-secondary/40 mb-2">Also known as:</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.altnames.map((name, i) => (
                                        <span key={i} className="px-2 py-1 bg-secondary/5 text-secondary/50 text-xs rounded-lg">{name}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Details */}
                        <div className="bg-white rounded-2xl border border-secondary/10 p-4">
                            <p className="text-sm font-bold text-secondary mb-3">Product Details</p>
                            <div className="space-y-2 text-sm">
                                {[
                                    { label: "Product ID", value: product.productid },
                                    { label: "Brand", value: product.brand },
                                    { label: "Model", value: product.model },
                                    { label: "Warranty", value: product.warranty || "No Warranty" },
                                    { label: "Category", value: product.category },
                                    { label: "Stock", value: `${product.stock} units` },
                                    { label: "Price", value: `Rs. ${product.price?.toLocaleString()}` },
                                ].map(({ label, value }) => value && (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-secondary/40">{label}</span>
                                        <span className="font-semibold text-secondary">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ Reviews Section ═══════════ */}
            <div className="max-w-6xl mx-auto px-6 pb-16">
                <div className="border-t border-secondary/10 pt-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-extrabold text-secondary">⭐ Customer Reviews</h2>
                            <p className="text-secondary/40 text-sm mt-1">
                                {reviews.length > 0
                                    ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} · Average: ${avgRating.toFixed(1)} / 5`
                                    : "No reviews yet. Be the first!"}
                            </p>
                        </div>
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-secondary/10">
                                <Stars rating={Math.round(avgRating)} size="text-lg" />
                                <span className="text-2xl font-extrabold text-secondary">{avgRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* ── Add Review Form (Only if eligible) ── */}
                        {eligibility.canReview && (
                            <div className="lg:w-80 flex-shrink-0">
                                <div className="bg-white rounded-2xl border border-secondary/10 p-5 shadow-sm">
                                    <h3 className="font-bold text-secondary mb-4">Write a Review</h3>

                                    {/* Star selector */}
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-secondary/50 mb-2">Your Rating</p>
                                        <Stars rating={myRating} size="text-2xl" interactive onRate={setMyRating} />
                                        <p className="text-xs text-secondary/40 mt-1">
                                            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][myRating]}
                                        </p>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-secondary/50 mb-2">Your Review</p>
                                        <textarea
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                            placeholder="Share your experience..."
                                            rows={4}
                                            className="w-full border-2 border-secondary/20 rounded-xl px-4 py-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={submitReview}
                                        disabled={submitting}
                                        className="w-full h-11 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 text-sm"
                                    >
                                        {submitting ? "Submitting..." : "Submit Review ⭐"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Reviews List (Full width if no form) ── */}
                        <div className={`flex-1 space-y-4 ${!eligibility.canReview ? 'w-full' : ''}`}>
                            {reviews.length === 0 ? (
                                <div className="text-center py-16 text-secondary/30">
                                    <p className="text-5xl mb-3">💬</p>
                                    <p className="font-semibold">No reviews yet</p>
                                    <p className="text-sm mt-1">Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="bg-white rounded-2xl border border-secondary/10 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent flex-shrink-0">
                                                    {review.userName?.[0]?.toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary text-sm">{review.userName || "Customer"}</p>
                                                    {editingReviewId === review._id ? (
                                                        <Stars rating={editRating} size="text-sm" interactive onRate={setEditRating} />
                                                    ) : (
                                                        <Stars rating={review.rating} size="text-sm" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <p className="text-secondary/30 text-[10px] font-bold uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </p>

                                                {/* Edit/Delete if own review OR Delete if admin */}
                                                <div className="flex items-center gap-2 ml-2">
                                                    {currentUser?.email && review.userEmail &&
                                                        currentUser.email.trim().toLowerCase() === review.userEmail.trim().toLowerCase() &&
                                                        editingReviewId !== review._id && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingReviewId(review._id);
                                                                    setEditRating(review.rating);
                                                                    setEditComment(review.comment);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Review"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                        )}
                                                    {(currentUser?.role === "admin" ||
                                                        (currentUser?.email && review.userEmail &&
                                                            currentUser.email.trim().toLowerCase() === review.userEmail.trim().toLowerCase())) && (
                                                            <button
                                                                onClick={() => deleteReview(review._id)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Review"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        {editingReviewId === review._id ? (
                                            <div className="mt-4 space-y-3">
                                                <textarea
                                                    value={editComment}
                                                    onChange={e => setEditComment(e.target.value)}
                                                    className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none bg-accent/5"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdateReview}
                                                        disabled={submitting}
                                                        className="px-4 py-1.5 bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingReviewId(null)}
                                                        className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-secondary/20 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="mt-3 text-secondary/70 text-sm leading-relaxed">{review.comment}</p>
                                                
                                                {review.reply && (currentUser?.role === 'admin' || 
                                                  (currentUser?.email && review.userEmail && 
                                                   currentUser.email.trim().toLowerCase() === review.userEmail.trim().toLowerCase())) && (
                                                    <div className="mt-4 p-4 bg-accent/5 rounded-2xl border-l-4 border-accent shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] text-white">
                                                                🛡️
                                                            </div>
                                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Store Response</p>
                                                        </div>
                                                        <p className="text-xs text-secondary/60 leading-relaxed italic">"{review.reply}"</p>
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest ${review.rating >= 4 ? "bg-green-100 text-green-700"
                                                        : review.rating === 3 ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-600"
                                                        }`}>
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating QR preview */}
            {showQR && (
                <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-secondary/10 p-3 w-48">
                    <p className="text-xs font-bold text-secondary/40 mb-2 text-center">📱 Quick Scan</p>
                    <QRCode value={qrData} size={150} bgColor="#ffffff" fgColor="#01303f" level="M" className="w-full" />
                    <p className="text-xs text-center text-accent font-bold mt-2 truncate">{product.name}</p>
                </div>
            )}
        </div>
    );
}
