import { useEffect, useState } from "react";
import { FaTrash, FaSearch, FaReply, FaStar, FaCheckCircle, FaTimes } from "react-icons/fa";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { confirmToast } from "../../utils/confirmToast";
import NotificationBell from "../../components/NotificationBell";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/reviews/all");
            setReviews(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    async function handleDelete(id) {
        const confirmed = await confirmToast("Delete this review?");
        if (!confirmed) return;
        try {
            await axiosClient.delete(`/reviews/${id}`);
            toast.success("Review deleted!");
            setReviews(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            toast.error("Delete failed!");
        }
    }

    async function handleReply() {
        if (!replyText.trim()) return toast.error("Reply cannot be empty");
        try {
            setSubmitting(true);
            await axiosClient.post(`/reviews/reply/${replyingId}`, { reply: replyText.trim() });
            toast.success("Reply posted!");
            setReplyingId(null);
            setReplyText("");
            fetchReviews();
        } catch (err) {
            toast.error("Failed to post reply");
        } finally {
            setSubmitting(false);
        }
    }

    const filtered = reviews.filter(r => 
        r.productName?.toLowerCase().includes(search.toLowerCase()) ||
        r.userName?.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-primary z-10 px-8 pt-8 pb-4 border-b border-secondary/10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-secondary tracking-tight">Customer Reviews</h1>
                        <p className="text-secondary/40 text-sm font-bold uppercase tracking-widest">Moderation & Quality Control</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <NotificationBell />
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
                    <input
                        type="text"
                        placeholder="Search reviews by product, user, or comment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto hide-scroll-track px-8 py-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-secondary/30">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="font-bold uppercase tracking-widest text-xs">No reviews found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-secondary/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-secondary/5">
                                <th className="pb-4 pr-4">Product</th>
                                <th className="pb-4 pr-4">Customer</th>
                                <th className="pb-4 pr-4">Rating</th>
                                <th className="pb-4 pr-4">Review</th>
                                <th className="pb-4 pr-4">Status</th>
                                <th className="pb-4 pr-4">Date</th>
                                <th className="pb-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                            {filtered.map((review) => (
                                <tr key={review._id} className="hover:bg-blue-50/30 transition-colors group">
                                    {/* Product */}
                                    <td className="py-5 pr-4 max-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <span className="text-lg">💻</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-secondary truncate">{review.productName}</p>
                                                <p className="text-[9px] text-secondary/40 font-bold uppercase tracking-widest truncate">{review.productId}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Customer */}
                                    <td className="py-5 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-black text-accent text-[10px]">
                                                {review.userName?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary text-xs">{review.userName}</p>
                                                <p className="text-[9px] text-secondary/30 font-bold">{review.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rating */}
                                    <td className="py-5 pr-4 text-amber-400">
                                        <div className="flex items-center gap-1">
                                            <span className="font-black text-secondary mr-1">{review.rating}</span>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < review.rating ? "text-amber-400" : "text-gray-200"} size={10} />
                                            ))}
                                        </div>
                                    </td>

                                    {/* Review */}
                                    <td className="py-5 pr-4 max-w-[300px]">
                                        <p className="text-secondary/70 text-xs italic leading-relaxed">"{review.comment}"</p>
                                        {review.reply && (
                                            <div className="mt-2 p-2 bg-accent/5 border-l-2 border-accent rounded-r-lg">
                                                <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Our Reply:</p>
                                                <p className="text-[10px] text-secondary/60 leading-tight">{review.reply}</p>
                                            </div>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-5 pr-4">
                                        {review.reply ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <FaCheckCircle size={8} /> Replied
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                                            </span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="py-5 pr-4">
                                        <span className="text-secondary/40 text-[10px] font-bold">
                                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setReplyingId(review._id);
                                                    setReplyText(review.reply || "");
                                                }}
                                                className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                title="Reply to Review"
                                            >
                                                <FaReply size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete Review"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reply Modal */}
            {replyingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-secondary/10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-xl font-black text-secondary tracking-tight">📝 Send Official Reply</h1>
                                <p className="text-secondary/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Customer Communication</p>
                            </div>
                            <button onClick={() => setReplyingId(null)} className="text-secondary/20 hover:text-red-500 transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-2">Review Summary</p>
                            <p className="text-sm font-bold text-secondary mb-1">"{reviews.find(r => r._id === replyingId)?.comment}"</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-accent font-black">{reviews.find(r => r._id === replyingId)?.userName}</span>
                                <span className="text-[10px] text-secondary/30 font-bold italic">via {reviews.find(r => r._id === replyingId)?.productName}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-2 ml-1">Your Response</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full h-40 bg-gray-50 border-2 border-secondary/10 rounded-2xl p-4 text-sm text-secondary focus:outline-none focus:border-accent transition-all resize-none"
                                    placeholder="Write a professional response to the customer..."
                                />
                            </div>

                            <button
                                onClick={handleReply}
                                disabled={submitting}
                                className="w-full h-12 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-accent transition-all shadow-xl shadow-secondary/10 disabled:opacity-50"
                            >
                                {submitting ? "Sending..." : "🚀 Post Reply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
