let ipadress = "100.119.203.57";


export async function getMovie(movieName : string) {
    const response = await fetch(`http://${ipadress}:5044/media/movie?movieName=${encodeURIComponent(movieName)}`, {
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
    console.log("Movie data in FE client:", receivedData);
    return receivedData;
}

export async function getCollections() {
    const response = await fetch(`http://${ipadress}:5044/media/collections`, {
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
    const response = await fetch(`http://${ipadress}:5044/media/posts`, {
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
    console.log("Posts data received:", receivedData);
    return receivedData;
}

