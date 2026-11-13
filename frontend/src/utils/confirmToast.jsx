import { toast } from "react-hot-toast";

/**
 * Shows a toast confirmation dialog instead of window.confirm()
 * Usage: const confirmed = await confirmToast("Are you sure?");
 * if (confirmed) { ... do action ... }
 */
export function confirmToast(message, options = {}) {
    const { confirmText = "Yes, Delete", icon = "🗑️", type = "danger" } = options;
    
    return new Promise((resolve) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2 min-w-[220px]">
                    <p className="text-sm font-semibold text-gray-800">{message}</p>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                            className={`flex-1 ${type === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors`}
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    padding: "14px",
                    borderRadius: "14px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    border: `1px solid ${type === "danger" ? "#f87171" : "#4ade80"}`,
                },
                icon: icon,
            }
        );
    });
}
