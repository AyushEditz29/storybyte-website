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

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) { alert("Login Error: " + error.message); }
});

document.getElementById("uploadBtn").addEventListener("click", async () => {
    let videoUrl = document.getElementById("manualVideoUrl").value;
    if (!videoUrl) { alert("Link daalo!"); return; }

    document.getElementById("uploadStatus").innerText = "Upload shuru ho raha hai...";
    document.getElementById("uploadBtn").disabled = true;

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "upload", url: videoUrl })
        });
        const data = await res.json();

        if(data.status === 200) {
            const remoteId = data.result.id;
            
            const checkStatus = async () => {
                const statusRes = await fetch(WORKER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "status", id: remoteId })
                });
                const statusData = await statusRes.json();
                
                // DATA FLEXIBILITY FIX: Status check
                let item = null;
                if(statusData.result) {
                    item = statusData.result[remoteId] || Object.values(statusData.result)[0];
                }
                
                if(item && (item.status === "finished" || item.status === "success")) {
                    uploadedVideoUrl = item.url || item.link || "";
                    document.getElementById("uploadStatus").innerText = "Upload Completed!";
                    document.getElementById("nextBtn").style.display = "block";
                } else {
                    document.getElementById("uploadStatus").innerText = "Processing... (Please wait)";
                    setTimeout(checkStatus, 5000); 
                }
            };
            checkStatus();
        } else { 
            alert("Error: " + (data.msg || "Server Error")); 
            document.getElementById("uploadBtn").disabled = false; 
        }
    } catch (e) { alert("Error: " + e.message); document.getElementById("uploadBtn").disabled = false; }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    if (!title || !uploadedVideoUrl) { alert("Data missing!"); return; }
    await addDoc(collection(db, "dramas"), { title, video: uploadedVideoUrl, createdAt: Date.now() });
    alert("Published!");
    window.location.href = "dashboard.html";
});