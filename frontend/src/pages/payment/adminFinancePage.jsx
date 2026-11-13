import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, Legend
} from "recharts";
import { FaArrowUp, FaArrowDown, FaPiggyBank, FaFileInvoiceDollar } from "react-icons/fa";

const COLORS = ["#10b981", "#ef4444", "#3b82f6"];

export default function AdminFinancePage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const res = await axiosClient.get("/finance/profit-summary");
            setSummary(res.data);
        } catch (err) {
            toast.error("Failed to load financial summary");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const { totalIncome, totalExpenses, netProfit } = summary.summary;

    const chartData = [
        { name: "Income", value: totalIncome, fill: "#10b981" },
        { name: "Expenses", value: totalExpenses, fill: "#ef4444" },
        { name: "Net Profit", value: netProfit > 0 ? netProfit : 0, fill: "#3b82f6" }
    ];

    const pieData = [
        { name: "Income", value: totalIncome },
        { name: "Expenses", value: totalExpenses }
    ];

    return (
        <div className="w-full h-full overflow-y-auto bg-primary p-8 hide-scroll-track">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-secondary">Financial Overview 💰</h1>
                    <p className="text-secondary/50 font-medium">Profit & Loss Analysis</p>
                </div>
                <div className={`px-5 py-2 rounded-2xl font-black text-sm uppercase tracking-widest border-2 ${
                    netProfit >= 0 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                    {summary.status}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><FaArrowUp className="text-6xl text-green-500" /></div>
                     <p className="text-[10px] font-black uppercase text-secondary/40 tracking-widest mb-1">Total Income</p>
                     <h2 className="text-2xl font-black text-green-600">Rs. {totalIncome.toLocaleString()}</h2>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><FaArrowDown className="text-6xl text-red-500" /></div>
                     <p className="text-[10px] font-black uppercase text-secondary/40 tracking-widest mb-1">Total Expenses</p>
                     <h2 className="text-2xl font-black text-red-600">Rs. {totalExpenses.toLocaleString()}</h2>
                </div>
                <div className="bg-secondary p-6 rounded-[32px] shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><FaPiggyBank className="text-6xl text-white" /></div>
                     <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Net Profit</p>
                     <h2 className={`text-2xl font-black ${netProfit >= 0 ? 'text-accent' : 'text-red-400'}`}>Rs. {netProfit.toLocaleString()}</h2>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart Comparison */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-secondary/5">
                    <h3 className="text-lg font-black text-secondary mb-8 flex items-center gap-3">
                        <FaFileInvoiceDollar className="text-accent" /> Comparison Analysis
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 800, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart Distribution */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-secondary/5">
                    <h3 className="text-lg font-black text-secondary mb-8">Income vs Expense Ratio</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Advice Section */}
            <div className="mt-8 bg-accent/5 border-2 border-accent/20 p-6 rounded-[32px] flex items-center gap-6">
                <div className="text-4xl">💡</div>
                <div>
                    <h4 className="font-black text-secondary">Business Insight</h4>
                    <p className="text-sm text-secondary/60 font-medium">
                        {netProfit > 0 
                            ? "Your business is currently profitable. Consider reinvesting into high-demand inventory items."
                            : "Your expenses are exceeding income. Review supplier pricing and optimize inventory movement."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
