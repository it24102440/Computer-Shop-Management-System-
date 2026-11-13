import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { FaUserPlus, FaCheck, FaTimes, FaBuilding, FaPhone, FaEnvelope } from "react-icons/fa";

export default function InvSuppliers() {
    const [pendingStaff, setPendingStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingStaff = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/users/pending-staff");
            setPendingStaff(res.data || []);
        } catch (err) {
            toast.error("Failed to load pending suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingStaff();
    }, []);

    const handleApprove = async (id, name) => {
        try {
            await axiosClient.patch(`/users/${id}/approve`);
            toast.success(`Success! ${name} is now an active supplier.`);
            fetchPendingStaff();
        } catch (err) {
            toast.error("Failed to approve supplier");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject and delete this request?")) return;
        try {
            await axiosClient.delete(`/users/${id}`);
            toast.success("Registration request rejected");
            fetchPendingStaff();
        } catch (err) {
            toast.error("Failed to reject request");
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8 bg-secondary/5">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-secondary flex items-center gap-2">
                    <FaUserPlus className="text-accent" /> Pending Supplier Registrations
                </h1>
                <p className="text-secondary/50 text-sm mt-1">Review and approve new suppliers to grant them system access.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-secondary/30">
                    <div className="animate-spin text-4xl mb-4">🌀</div>
                    <p>Fetching registrations...</p>
                </div>
            ) : pendingStaff.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-secondary/20 shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
                    <p className="font-extrabold text-secondary text-lg">Inbox is Empty</p>
                    <p className="text-secondary/50 text-sm max-w-xs mx-auto mt-2">No new supplier registration requests at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingStaff.map(staff => (
                        <div key={staff._id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-secondary/5 hover:border-accent/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                            
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-accent/20">
                                    {staff.firstName[0]}{staff.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                                        {staff.firstName} {staff.lastName}
                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-widest">Pending Approval</span>
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                        <div className="flex items-center gap-1.5 text-secondary/50 text-xs">
                                            <FaBuilding className="text-accent/60" /> 
                                            <span className="font-bold text-secondary/70">{staff.companyName || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-secondary/50 text-xs">
                                            <FaEnvelope className="text-accent/60" /> {staff.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-secondary/50 text-xs">
                                            <FaPhone className="text-accent/60" /> {staff.contactNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button 
                                    onClick={() => handleApprove(staff._id, `${staff.firstName} ${staff.lastName}`)}
                                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-accent transition-all shadow-lg shadow-secondary/10"
                                >
                                    <FaCheck /> Approve Access
                                </button>
                                <button 
                                    onClick={() => handleReject(staff._id)}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <FaTimes /> Reject
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
