export async function getMovie(movieName : string) {
    const response = await fetch(`http://100.90.173.113:5044/media/movie?movieName=${encodeURIComponent(movieName)}`, {
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