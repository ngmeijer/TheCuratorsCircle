export async function login(email : string, password: string) {
    const response = await fetch("", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
    });

    // if(!response.ok) {
    //     throw new Error(response.statusText);
    // }

    return {
        success: true,
        token: "TEST_TOKEN",
        user: {
            email,
            name: "Test User",
        }
    };
}