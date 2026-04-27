import { API_BASE_URL } from "../config";

export async function login(email : string, password: string) {
    const json = JSON.stringify({email, password});

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: json,
    });

    let data;

    if(!response.ok) {
        try {
            data = await response.json();
        } catch {
            // Fallback if body is empty or not JSON
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    return response.json();
}

export async function signup(email : string, password: string) {
    const json = JSON.stringify({email, password});

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: json,
    });

    let data;

    if(!response.ok) {
        try {
            data = await response.json();
        } catch {
            // Fallback if body is empty or not JSON
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    return response.json();
}
