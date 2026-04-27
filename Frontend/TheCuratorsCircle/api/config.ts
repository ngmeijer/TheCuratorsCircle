if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env and fill in the value.");
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
