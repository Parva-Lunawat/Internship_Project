const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

function extractErrorMessage(errorData: unknown): string | null {
    if (!errorData || typeof errorData !== "object") {
        return null;
    }

    const payload = errorData as { message?: unknown; error?: { message?: unknown } };
    const candidate = payload.message ?? payload.error?.message;

    if (Array.isArray(candidate)) {
        return candidate.join(", ");
    }

    return typeof candidate === "string" ? candidate : null;
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            const message = extractErrorMessage(errorData);
            if (message) {
                errorMessage = message;
            }
        } catch {
            // Fallback to error message
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

/**
 * Uploads an image file to the server.
 * @param file The image file to upload
 * @returns The server-provided image URL
 */
export async function uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: "POST",
        body: formData,
        credentials: 'include', // Important for local dev sessions
    });

    const data = await parseResponse<{ url: string }>(response);
    
    // The backend returns a relative URL like "/v1/uploads/uuid.png"
    // We transform it into a full URL by prepending the backend base
    const backendBase = API_BASE_URL.replace('/api/v1', '');
    return {
        url: `${backendBase}${data.url}`
    };
}
