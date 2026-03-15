"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jobsAPI, authAPI } from "@/services/api";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [statsData, userData] = await Promise.all([
                    jobsAPI.stats(),
                    authAPI.me(),
                ]);
                setStats(statsData);
                setUser(userData);
            } catch (err) {
                if (err.message.includes("credentials")) {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Total Jobs",
            value: stats?.total || 0,
            icon: "📋",
            color: "from-violet-500/20 to-violet-600/10",
            border: "border-violet-500/20",
            text: "text-violet-400",
        },
        {
            label: "Pending",
            value: stats?.pending || 0,
            icon: "⏳",
            color: "from-amber-500/20 to-amber-600/10",
            border: "border-amber-500/20",
            text: "text-amber-400",
        },
        {
            label: "Processing",
            value: stats?.processing || 0,
            icon: "⚙️",
            color: "from-blue-500/20 to-blue-600/10",
            border: "border-blue-500/20",
            text: "text-blue-400",
        },
        {
            label: "Completed",
            value: stats?.completed || 0,
            icon: "✅",
            color: "from-emerald-500/20 to-emerald-600/10",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
        },
        {
            label: "Failed",
            value: stats?.failed || 0,
            icon: "❌",
            color: "from-red-500/20 to-red-600/10",
            border: "border-red-500/20",
            text: "text-red-400",
        },
    ];

    const quickActions = [
        { href: "/upload", label: "Upload Resumes", icon: "📤", desc: "Upload new resumes for processing" },
        { href: "/jobs", label: "Track Jobs", icon: "⚙️", desc: "Monitor processing status" },
        { href: "/ranking", label: "View Rankings", icon: "🏆", desc: "See candidate rankings" },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
                    </h1>
                    <p className="text-slate-400">Here&apos;s an overview of your resume processing pipeline</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10 stagger-children">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 animate-fade-in-up hover:scale-[1.02] transition-transform duration-200`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <p className={`text-3xl font-bold ${card.text} mb-1`}>{card.value}</p>
                            <p className="text-slate-400 text-sm">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-5">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 hover:border-violet-500/30 hover:bg-slate-800/40 transition-all duration-300 animate-fade-in-up"
                            >
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{action.icon}</div>
                                <h3 className="text-white font-semibold mb-1">{action.label}</h3>
                                <p className="text-slate-400 text-sm">{action.desc}</p>
                                <div className="mt-4 text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Go →
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Pipeline Info */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 animate-fade-in-up">
                    <h2 className="text-lg font-semibold text-white mb-4">Processing Pipeline</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        {["Upload PDFs", "Queue Jobs", "Parse Text", "Extract Skills", "Generate Embeddings", "Match & Rank"].map(
                            (step, i) => (
                                <div key={step} className="flex items-center gap-3">
                                    <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-300">
                                        {step}
                                    </span>
                                    {i < 5 && <span className="text-slate-600">→</span>}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
