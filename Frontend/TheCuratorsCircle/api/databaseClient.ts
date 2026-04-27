import {PostDto} from "@/DTOs/PostDto";
import { API_BASE_URL } from "./config";

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
    const response = await fetch(`${API_BASE_URL}/collections`, {
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

export async function getCollectionsByUserId(userId: string) {
    const response = await fetch(`http://${ipadress}:5044/collections?userId=${encodeURIComponent(userId)}`, {
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
    return receivedData;
}

export async function getCollection(collectionId: string) {
    console.log("Getting collection from backend:", collectionId);
    const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
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
    const response = await fetch(`${API_BASE_URL}/collections`, {
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
    const response = await fetch(`${API_BASE_URL}/posts`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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
    const response = await fetch(`${API_BASE_URL}/media/search?query=${encodeURIComponent(query)}&mediaType=${encodeURIComponent(category)}`, {
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
    const response = await fetch(`${API_BASE_URL}/media/media?id=${encodeURIComponent(id)}&mediaType=${encodeURIComponent(mediaType)}`, {
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
    const response = await fetch(`${API_BASE_URL}/posts`, {
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
    const response = await fetch(`${API_BASE_URL}/userprofiles/by-alias/${encodeURIComponent(alias)}`, {
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
    const response = await fetch(`${API_BASE_URL}/userprofiles/${persistentId}`, {
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
    const response = await fetch(`${API_BASE_URL}/userprofiles`, {
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

export async function getCurrentUserProfile(): Promise<any> {
    console.log("Getting current user profile");
    const response = await fetch(`${API_BASE_URL}/userprofiles/me`, {
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
    console.log("Current user profile received:", receivedData);
    return receivedData;
}

export interface UpdateUserProfilePayload {
    username?: string;
    displayName?: string;
    bio?: string;
    isPublic?: boolean;
}

export async function updateUserProfile(persistentId: string, payload: UpdateUserProfilePayload): Promise<any> {
    console.log("Updating user profile:", persistentId, payload);
    const response = await fetch(`${API_BASE_URL}/userprofiles/${persistentId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
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
    console.log("User profile updated:", receivedData);
    return receivedData;
}

export async function followUser(targetUserId: string): Promise<any> {
    console.log("Following user:", targetUserId);
    const response = await fetch(`${API_BASE_URL}/follows`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Error ${response.status}`);
    }

    return response.json();
}

export async function unfollowUser(targetUserId: string): Promise<any> {
    console.log("Unfollowing user:", targetUserId);
    const response = await fetch(`${API_BASE_URL}/follows/${targetUserId}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Error ${response.status}`);
    }

    return response.json();
}

export async function getFollowingList(): Promise<any[]> {
    console.log("Getting following list");
    const response = await fetch(`${API_BASE_URL}/follows/me/following`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error(`Error ${response.status}`);
    }

    return response.json();
}

export async function getFollowersList(): Promise<any[]> {
    console.log("Getting followers list");
    const response = await fetch(`${API_BASE_URL}/follows/me/followers`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error(`Error ${response.status}`);
    }

    return response.json();
}

export async function getIsFollowing(userId: string): Promise<boolean> {
    console.log("Checking if following:", userId);
    const response = await fetch(`${API_BASE_URL}/follows/${userId}/is-following`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.isFollowing;
}

export async function getFollowingCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/follows/${userId}/following-count`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) return 0;
    const data = await response.json();
    return data.count;
}

export async function getFollowersCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/follows/${userId}/followers-count`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) return 0;
    const data = await response.json();
    return data.count;
}

export async function getFeed(startAfter?: string, limit: number = 20): Promise<{ posts: any[], hasMore: boolean, nextCursor: string | null }> {
    let url = `${API_BASE_URL}/posts/feed?limit=${limit}`;
    if (startAfter) {
        url += `&startAfter=${encodeURIComponent(startAfter)}`;
    }
    console.log("[API] Getting feed from backend:", startAfter ? 'loading more' : 'first page');
    const response = await fetch(url, {
        method: "GET",
        headers: getHeaders()
    });

    console.log("[API] Feed response status:", response.status);

    if (!response.ok) {
        if (response.status === 401) {
            return { posts: [], hasMore: false, nextCursor: null };
        }
        let errorMessage = `Error ${response.status}`;
        try {
            const errorData = await response.json();
            console.error("[API] Feed error response:", errorData);
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
            const errorText = await response.text();
            console.error("[API] Feed error text:", errorText);
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("[API] Feed data received:", data.posts?.length || 0, "posts, hasMore:", data.hasMore);
    return data;
}

export async function searchUsers(query: string): Promise<any[]> {
    if (!query || query.length < 2) return [];

    const response = await fetch(`${API_BASE_URL}/userprofiles/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        return [];
    }

    return response.json();
}
