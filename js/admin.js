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

// Yahan apna Worker URL daalo jo Cloudflare ne diya hai
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
    if (!videoUrl) { alert("Drive link paste karo!"); return; }

    document.getElementById("uploadStatus").innerText = "Cloudflare Worker ke through bhej rahe hain...";
    document.getElementById("uploadBtn").disabled = true;

    try {
        // Worker ko request bhej rahe hain
        const res = await fetch(WORKER_URL, {
            method: "POST",
            body: JSON.stringify({ url: videoUrl })
        });
        const data = await res.json();

        if(data.status === 200) {
            const remoteId = data.result.id;
            document.getElementById("uploadStatus").innerText = "Upload Shuru ho gaya! Wait karo...";
            
            // Loop check
            const checkStatus = async () => {
                const statusRes = await fetch(`https://api.streamtape.com/remotedl/getstatus?login=adfb41ddf0db9841c580&key=Qazqwk3bAWf0Q4r&id=${remoteId}`);
                const statusData = await statusRes.json();
                
                const item = statusData.result ? statusData.result[remoteId] : null;
                
                if(item && item.status === "finished") {
                    uploadedVideoUrl = item.url || item.link;
                    document.getElementById("uploadStatus").innerText = "Upload Completed!";
                    document.getElementById("nextBtn").style.display = "block";
                } else {
                    document.getElementById("uploadStatus").innerText = "Still processing... (Cloudflare active)";
                    setTimeout(checkStatus, 5000); 
                }
            };
            checkStatus();
        } else {
            alert("Error: " + data.msg);
            document.getElementById("uploadBtn").disabled = false;
        }
    } catch (e) { alert("Worker Error: " + e.message); document.getElementById("uploadBtn").disabled = false; }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const description = document.getElementById("description").value;
    
    if (!title || !uploadedVideoUrl) { alert("Title aur Link zaroori hai!"); return; }
    
    await addDoc(collection(db, "dramas"), { 
        title, category, poster, description, video: uploadedVideoUrl, 
        views: 0, createdAt: Date.now() 
    });
    
    alert("Published!");
    window.location.href = "dashboard.html";
});