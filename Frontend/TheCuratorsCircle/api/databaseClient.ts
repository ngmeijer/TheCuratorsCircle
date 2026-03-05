import {PostDto} from "@/DTOs/PostDto";

let ipadress = "100.119.203.57";
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

function getHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
    };
}

export async function getCollections() {
    console.log("Getting collections from backend");
    const response = await fetch(`http://${ipadress}:5044/collections`, {
        method: "GET",
        headers: getHeaders()
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log("Collections data received:", receivedData);

    return receivedData;
}

export async function getCollection(collectionId: string) {
    console.log("Getting collection from backend:", collectionId);
    const response = await fetch(`http://${ipadress}:5044/collections/${collectionId}`, {
        method: "GET",
        headers: getHeaders()
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log("Collection data received:", receivedData);

    return receivedData;
}

export interface CreateCollectionPayload {
    name: string;
}

export async function createCollection(payload: CreateCollectionPayload) {
    console.log("Creating collection:", payload);
    const response = await fetch(`http://${ipadress}:5044/collections`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log("Collection created:", receivedData);

    return receivedData;
}

export async function getPosts() {
    console.log("Getting posts from backend");
    const response = await fetch(`http://${ipadress}:5044/posts`, {
        method: "GET",
        headers: getHeaders()
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log(
        "Posts data received:\n",
        JSON.stringify(receivedData, null, 2)
    );
    return receivedData;
}

export async function getPost(postId: string){
    console.log("Getting specific post from backend");
    const response = await fetch(`http://${ipadress}:5044/posts/${postId}`, {
        method: "GET",
        headers: getHeaders()
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log(
        "Specific post data received:\n",
        JSON.stringify(receivedData, null, 2)
    );
    return receivedData;
}

export type MediaCategory = 'movie' | 'series' | 'game' | 'book' | 'music';

export interface MediaSearchResult {
    id: string;
    title: string;
    year: string;
    type: string;
    posterUrl: string;
    plot?: string;
    genre?: string;
    rating?: number;
}

export async function searchMedia(query: string, category: MediaCategory = 'movie'): Promise<MediaSearchResult[]> {
    console.log("Searching media:", query, category);
    const response = await fetch(`http://${ipadress}:5044/media/search?query=${encodeURIComponent(query)}&mediaType=${encodeURIComponent(category)}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        return [];
    }

    const receivedData = await response.json();
    return receivedData;
}

export async function getMediaById(id: string, mediaType: string = 'movie'): Promise<MediaSearchResult | null> {
    console.log("Getting media by ID:", id, mediaType);
    const response = await fetch(`http://${ipadress}:5044/media/media?id=${encodeURIComponent(id)}&mediaType=${encodeURIComponent(mediaType)}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        console.error("Failed to get media:", response.status);
        return null;
    }

    const receivedData = await response.json();
    return receivedData;
}

export interface CreatePostPayload {
    title: string;
    caption: string;
    mediaType: string;
    mediaId: string;
    collectionId: string;
}

export async function createPost(payload: CreatePostPayload): Promise<any> {
    console.log("Creating post:", payload);
    const response = await fetch(`http://${ipadress}:5044/posts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: "Unknown error." };
        }
        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log("Post created:", receivedData);
    return receivedData;
}

export interface CreateUserProfilePayload {
    username: string;
    displayName?: string;
    bio?: string;
}

export async function getUserProfileByAlias(alias: string): Promise<any> {
    console.log("Getting user profile by alias:", alias);
    const response = await fetch(`http://${ipadress}:5044/userprofiles/by-alias/${encodeURIComponent(alias)}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        let responseText = "";
        try {
            responseText = await response.text();
            console.log("Error response text:", responseText);
            const data = JSON.parse(responseText);
            throw new Error(data.message || `Error ${response.status}`);
        } catch (e: any) {
            if (e instanceof Error && e.message.includes("Error")) throw e;
            throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
        }
    }

    const receivedData = await response.json();
    console.log("User profile by alias received:", receivedData);
    return receivedData;
}

export async function getUserProfileById(persistentId: string): Promise<any> {
    console.log("Getting user profile by ID:", persistentId);
    const response = await fetch(`http://${ipadress}:5044/userprofiles/${persistentId}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        let responseText = "";
        try {
            responseText = await response.text();
            console.log("Error response text:", responseText);
            const data = JSON.parse(responseText);
            throw new Error(data.message || `Error ${response.status}`);
        } catch (e: any) {
            if (e instanceof Error && e.message.includes("Error")) throw e;
            throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
        }
    }

    const receivedData = await response.json();
    console.log("User profile by ID received:", receivedData);
    return receivedData;
}

export async function createUserProfile(payload: CreateUserProfilePayload): Promise<any> {
    console.log("Creating user profile:", payload);
    const response = await fetch(`http://${ipadress}:5044/userprofiles`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let data;
        let responseText = "";
        try {
            responseText = await response.text();
            console.log("Error response text:", responseText);
            data = JSON.parse(responseText);
        } catch {
            data = { message: "Unknown error.", details: responseText };
        }
        console.error("Create profile failed:", {
            status: response.status,
            statusText: response.statusText,
            data
        });
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    const receivedData = await response.json();
    console.log("User profile created:", receivedData);
    return receivedData;
}
