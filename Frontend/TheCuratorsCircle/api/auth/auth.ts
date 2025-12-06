export async function login(email : string, password: string) {
    const response = await fetch("https://localhost:44343", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
    });

    if(!response.ok) {
        throw new Error("Failed to login: " + response.statusText);
    }

    return response.json();
}