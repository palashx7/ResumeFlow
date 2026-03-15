"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobsAPI } from "@/services/api";

const STATUS_STYLES = {
    pending: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        dot: "bg-amber-400",
        label: "Pending",
    },
    processing: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        dot: "bg-blue-400 animate-pulse",
        label: "Processing",
    },
    completed: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
        label: "Completed",
    },
    failed: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        dot: "bg-red-400",
        label: "Failed",
    },
};

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchJobs = async () => {
        try {
            const data = await jobsAPI.list();
            setJobs(data);
        } catch (err) {
            if (err.message.includes("credentials")) {
                localStorage.removeItem("token");
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            router.push("/login");
            return;
        }
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000);
        return () => clearInterval(interval);
    }, [router]);

    const filteredJobs = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

    const counts = {
        all: jobs.length,
        pending: jobs.filter((j) => j.status === "pending").length,
        processing: jobs.filter((j) => j.status === "processing").length,
        completed: jobs.filter((j) => j.status === "completed").length,
        failed: jobs.filter((j) => j.status === "failed").length,
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Job Tracking</h1>
                        <p className="text-slate-400">Monitor your resume processing jobs in real-time</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Auto-refreshing
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up">
                    {["all", "pending", "processing", "completed", "failed"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === status
                                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                    : "bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:text-white hover:border-slate-600"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 text-xs opacity-70">({counts[status]})</span>
                        </button>
                    ))}
                </div>

                {/* Jobs List */}
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in-up">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-slate-400 text-lg mb-2">No jobs found</p>
                        <p className="text-slate-500 text-sm">Upload some resumes to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {filteredJobs.map((job) => {
                            const style = STATUS_STYLES[job.status] || STATUS_STYLES.pending;
                            return (
                                <div
                                    key={job.job_id}
                                    className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/60 transition-all animate-fade-in-up"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Status badge */}
                                            <span
                                                className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 ${style.bg} border ${style.border} rounded-lg text-xs font-medium ${style.text}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                                {style.label}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    Job {job.job_id.slice(0, 8)}...
                                                </p>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                    {job.job_description?.slice(0, 80)}
                                                    {job.job_description?.length > 80 ? "..." : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                                            {job.retry_count > 0 && (
                                                <span className="text-amber-400">⟳ {job.retry_count} retries</span>
                                            )}
                                            <span>{new Date(job.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {job.error_message && (
                                        <div className="mt-3 ml-14 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                                            Error: {job.error_message}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
