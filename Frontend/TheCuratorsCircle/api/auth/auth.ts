export async function login(email : string, password: string) {
    const json = JSON.stringify({email, password});

    const response = await fetch("http://100.90.173.113:5044/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: json,
    });

    if(!response.ok) {
        // Try to read error from backend
        let errorMessage = response.statusText;

        try {
            const errorBody = await response.json();
            // Adjust depending on how your backend returns errors
            errorMessage = errorBody?.message || JSON.stringify(errorBody);
        } catch {
            // Fallback if body is empty or not JSON
            errorMessage = response.statusText || "Unknown error";
        }

        throw new Error("Failed to login: " + errorMessage);
    }

    return response.json();
}

// // Import the functions you need from the SDKs you need
//
// import { initializeApp } from "firebase/app";
//
// import { getAnalytics } from "firebase/analytics";
//
// // TODO: Add SDKs for Firebase products that you want to use
//
// // https://firebase.google.com/docs/web/setup#available-libraries
//
//
// // Your web app's Firebase configuration
//
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
//
// const firebaseConfig = {
//
//     apiKey: "AIzaSyBwcToSEZCqHamHdGZx_gcXlQmXtzXDRDk",
//
//     authDomain: "the-curator-s-circle.firebaseapp.com",
//
//     projectId: "the-curator-s-circle",
//
//     storageBucket: "the-curator-s-circle.firebasestorage.app",
//
//     messagingSenderId: "19412490552",
//
//     appId: "1:19412490552:web:9f99fb97442471253a89cd",
//
//     measurementId: "G-WYSZMGVM7R"
//
// };
//
//
// // Initialize Firebase
//
// const app = initializeApp(firebaseConfig);
//
// const analytics = getAnalytics(app);