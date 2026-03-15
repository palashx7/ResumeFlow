"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resumesAPI } from "@/services/api";

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState("");
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) router.push("/login");
    }, [router]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            (f) => f.type === "application/pdf"
        );
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files).filter(
            (f) => f.type === "application/pdf"
        );
        setFiles((prev) => [...prev, ...selected]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setError("Please upload at least one PDF resume");
            return;
        }
        if (!jobDescription.trim()) {
            setError("Please enter a job description");
            return;
        }

        setError("");
        setLoading(true);
        try {
            const data = await resumesAPI.upload(files, jobDescription);
            setResult(data);
            setFiles([]);
            setJobDescription("");
        } catch (err) {
            setError(err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-white mb-2">Upload Resumes</h1>
                    <p className="text-slate-400">Upload PDF resumes and a job description to start processing</p>
                </div>

                {/* Success message */}
                {result && (
                    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">✅</span>
                            <h3 className="text-emerald-400 font-semibold">{result.message}</h3>
                        </div>
                        <p className="text-slate-300 text-sm ml-9">
                            {result.jobs_created} job(s) created and queued for processing.
                        </p>
                        <button
                            onClick={() => router.push("/jobs")}
                            className="mt-3 ml-9 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                            Track jobs →
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    {/* Drag & Drop Zone */}
                    <div className="animate-fade-in-up">
                        <label className="block text-sm font-medium text-slate-300 mb-3">Resume Files (PDF)</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${dragging
                                    ? "border-violet-500 bg-violet-500/10"
                                    : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/30"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="text-4xl mb-3">📄</div>
                            <p className="text-white font-medium mb-1">
                                {dragging ? "Drop files here" : "Drag & drop PDF files here"}
                            </p>
                            <p className="text-slate-500 text-sm">or click to browse</p>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2 animate-fade-in-up">
                            <p className="text-sm font-medium text-slate-300">{files.length} file(s) selected</p>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                {files.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-slate-800/50 border border-slate-700/30 rounded-xl px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg">📄</span>
                                            <span className="text-sm text-slate-300 truncate">{file.name}</span>
                                            <span className="text-xs text-slate-500 shrink-0">
                                                {(file.size / 1024).toFixed(0)} KB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Job Description */}
                    <div className="animate-fade-in-up">
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-300 mb-3">
                            Job Description
                        </label>
                        <textarea
                            id="jobDescription"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={6}
                            required
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                            placeholder="e.g. Looking for a Backend Developer with experience in Python, FastAPI, PostgreSQL, and distributed systems..."
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || files.length === 0}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Uploading & Creating Jobs...
                            </span>
                        ) : (
                            `Upload ${files.length} Resume${files.length !== 1 ? "s" : ""} & Start Processing`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
