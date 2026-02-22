import {PostDto} from "@/DTOs/PostDto";

let ipadress = "100.119.203.57";

export async function getCollections() {
    const response = await fetch(`http://${ipadress}:5044/user/collections`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            // Fallback if body is empty or not JSON
            data = { message: "Unknown error."};
        }

        throw new Error(data.message);
    }

    const receivedData = await response.json();
    console.log("Collections data received:", receivedData);

    return receivedData;
}

export async function getPosts() {
    console.log("Getting posts from backend");
    const response = await fetch(`http://${ipadress}:5044/user/posts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            // Fallback if body is empty or not JSON
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

export async function getPost(postId: string){
    console.log("Getting specific post from backend");
    const response = await fetch(`http://${ipadress}:5044/user/posts/${postId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if(!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            // Fallback if body is empty or not JSON
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
