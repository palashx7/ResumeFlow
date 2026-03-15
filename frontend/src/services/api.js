// In production (when deployed to Render/Vercel), we want to use the same domain 
// if next_public_api_url isn't explicitly set during build time.
const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // If we are running in the browser and no env var is set, use the current domain
    if (typeof window !== "undefined") {
        // If we are on localhost, the backend is likely on 8000
        if (window.location.hostname === "localhost") {
            return "http://localhost:8000";
        }
        // In production on Render/Vercel, the API should be accessible on the same domain or via a proxy
        return `https://resumeflow-backend-monolith.onrender.com`;
    }

    return "http://localhost:8000";
};

const API_URL = getApiUrl();

/**
 * Get the stored auth token.
 */
function getToken() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}

/**
 * Make an authenticated API request.
 */
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || "Request failed");
    }

    return response.json();
}

/**
 * Auth API
 */
export const authAPI = {
    register: (email, password) =>
        apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    login: (email, password) =>
        apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    me: () => apiRequest("/auth/me"),
};

/**
 * Resumes API
 */
export const resumesAPI = {
    upload: (files, jobDescription) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("resumes", file);
        });
        formData.append("job_description", jobDescription);

        return apiRequest("/resumes/upload", {
            method: "POST",
            body: formData,
        });
    },
};

/**
 * Jobs API
 */
export const jobsAPI = {
    list: () => apiRequest("/jobs"),
    stats: () => apiRequest("/jobs/stats"),
};

/**
 * Candidates API
 */
export const candidatesAPI = {
    ranking: () => apiRequest("/candidates/ranking"),
};
