const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
