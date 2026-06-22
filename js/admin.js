import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCsGRspc2VB-xJq5XtmmkPKqOU90cdvvVI",
    authDomain: "storybyteappin.firebaseapp.com",
    projectId: "storybyteappin",
    storageBucket: "storybyteappin.firebasestorage.app",
    messagingSenderId: "113135240391",
    appId: "1:113135240391:web:53586b59385268dfefeae2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const WORKER_URL = "https://storybyte-streamtape.storybyte029.workers.dev/"; 
let uploadedVideoUrl = "";

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) { alert("Login Error: " + error.message); }
});

// UPLOAD PROCESS (Worker Integrated)
document.getElementById("uploadBtn").addEventListener("click", async () => {
    let videoUrl = document.getElementById("manualVideoUrl").value;
    if (!videoUrl) { alert("Drive link daalo!"); return; }

    document.getElementById("uploadStatus").innerText = "Cloudflare Worker processing...";
    document.getElementById("uploadBtn").disabled = true;

    try {
        // 1. Upload Request
        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "upload", url: videoUrl })
        });
        const data = await res.json();

        if(data.status === 200) {
            const remoteId = data.result.id;
            document.getElementById("uploadStatus").innerText = "Upload Started...";
            
            // 2. Status Loop
            const checkStatus = async () => {
                const statusRes = await fetch(WORKER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "status", id: remoteId })
                });
                const statusData = await statusRes.json();
                
                const item = statusData.result ? statusData.result[remoteId] : null;
                
                if(item && (item.status === "finished" || item.status === "success")) {
                    uploadedVideoUrl = item.url || item.link || "";
                    document.getElementById("uploadStatus").innerText = "Upload Completed!";
                    document.getElementById("nextBtn").style.display = "block";
                } else {
                    document.getElementById("uploadStatus").innerText = "Processing... (Waiting for Streamtape)";
                    setTimeout(checkStatus, 5000); 
                }
            };
            checkStatus();
        } else { 
            alert("Failed: " + (data.msg || "Unknown error")); 
            document.getElementById("uploadBtn").disabled = false; 
        }
    } catch (e) { alert("Error: " + e.message); document.getElementById("uploadBtn").disabled = false; }
});

// NAVIGATION & PUBLISH
document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    if (!title || !uploadedVideoUrl) { alert("Title aur Video Link fill karo!"); return; }
    
    await addDoc(collection(db, "dramas"), { 
        title, video: uploadedVideoUrl, createdAt: Date.now() 
    });
    
    alert("Drama Published Successfully!");
    window.location.href = "dashboard.html";
});