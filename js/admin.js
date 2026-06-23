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

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    try {
        await signInWithEmailAndPassword(auth, document.getElementById("email").value, document.getElementById("password").value);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (e) { alert("Login Error: " + e.message); }
});

// Upload
document.getElementById("uploadBtn").addEventListener("click", async () => {
    let videoUrl = document.getElementById("manualVideoUrl").value;
    const statusEl = document.getElementById("uploadStatus");
    const linkEl = document.getElementById("generatedLink");
    
    statusEl.innerText = "Processing...";

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "upload", url: videoUrl })
        });
        const data = await res.json();

        if(data.status === 200) {
            const remoteId = data.result.id;
            const check = async () => {
                const sRes = await fetch(WORKER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "status", id: remoteId })
                });
                const sData = await sRes.json();
                let item = sData.result ? (sData.result[remoteId] || Object.values(sData.result)[0]) : null;
                
                if(item && (item.status === "finished" || item.status === "success")) {
                    linkEl.value = item.url || item.link || "";
                    statusEl.innerText = "Upload Completed!";
                } else {
                    statusEl.innerText = "Processing... (Streamtape se link copy karke box mein paste karlo)";
                    setTimeout(check, 5000); 
                }
            };
            check();
        }
    } catch (e) { alert("Error: " + e.message); }
});

// Next Step
document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

// Publish
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const videoUrl = document.getElementById("generatedLink").value; 
    
    if (!title || !videoUrl) { alert("Title ya Link missing hai!"); return; }
    
    await addDoc(collection(db, "dramas"), { 
        title, video: videoUrl, createdAt: Date.now() 
    });
    alert("Drama Published!");
    location.reload();
});