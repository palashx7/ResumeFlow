"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { candidatesAPI } from "@/services/api";

function getScoreColor(score) {
    if (score >= 0.8) return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" };
    if (score >= 0.6) return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" };
    if (score >= 0.4) return { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" };
    return { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" };
}

function getScoreBar(score) {
    if (score >= 0.8) return "bg-gradient-to-r from-emerald-500 to-emerald-400";
    if (score >= 0.6) return "bg-gradient-to-r from-blue-500 to-blue-400";
    if (score >= 0.4) return "bg-gradient-to-r from-amber-500 to-amber-400";
    return "bg-gradient-to-r from-red-500 to-red-400";
}

function getMedal(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
}

export default function RankingPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            router.push("/login");
            return;
        }

        const fetchCandidates = async () => {
            try {
                const data = await candidatesAPI.ranking();
                setCandidates(data);
            } catch (err) {
                if (err.message.includes("credentials")) {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [router]);

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
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-white mb-2">Candidate Rankings</h1>
                    <p className="text-slate-400">
                        Candidates ranked by match score with the job description
                        {candidates.length > 0 && (
                            <span className="text-slate-500"> · {candidates.length} candidates</span>
                        )}
                    </p>
                </div>

                {candidates.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in-up">
                        <div className="text-4xl mb-4">🏆</div>
                        <p className="text-slate-400 text-lg mb-2">No candidates ranked yet</p>
                        <p className="text-slate-500 text-sm">Upload and process resumes to see rankings</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {candidates.map((candidate, index) => {
                            const scoreColor = getScoreColor(candidate.match_score);
                            return (
                                <div
                                    key={candidate.id}
                                    className={`bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/60 transition-all animate-fade-in-up ${index < 3 ? "ring-1 ring-violet-500/10" : ""
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Rank */}
                                        <div className="text-2xl font-bold text-center w-12 shrink-0">
                                            {getMedal(index)}
                                        </div>

                                        {/* Candidate Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-white font-semibold text-lg truncate">{candidate.name}</h3>
                                                <span
                                                    className={`shrink-0 px-3 py-1 ${scoreColor.bg} border ${scoreColor.border} ${scoreColor.text} rounded-lg text-sm font-bold`}
                                                >
                                                    {(candidate.match_score * 100).toFixed(1)}%
                                                </span>
                                            </div>

                                            {/* Score bar */}
                                            <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
                                                <div
                                                    className={`h-2 rounded-full ${getScoreBar(candidate.match_score)} transition-all duration-500`}
                                                    style={{ width: `${candidate.match_score * 100}%` }}
                                                ></div>
                                            </div>

                                            {/* Skills */}
                                            {candidate.skills && candidate.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {candidate.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/40 rounded-lg text-xs text-slate-300"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="text-xs text-slate-500 shrink-0">
                                            {new Date(candidate.processed_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
