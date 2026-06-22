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

const ST_LOGIN = "adfb41ddf0db9841c580"; 
const ST_KEY = "Qazqwk3bAWf0Q4r";
let uploadedVideoUrl = ""; 

// Login Logic
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) { alert("Login Error: " + error.message); }
});

// Remote Upload Logic (With Drive Converter)
document.getElementById("uploadBtn").addEventListener("click", async () => {
    let videoUrl = document.getElementById("manualVideoUrl").value;
    if (!videoUrl) { alert("Pehle link paste karo!"); return; }

    // Logic: Convert Google Drive View link to Download link
    if (videoUrl.includes("/file/d/")) {
        const fileId = videoUrl.split("/d/")[1].split("/")[0];
        videoUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    document.getElementById("uploadStatus").innerText = "Transferring to Streamtape... please wait...";
    const remoteUrl = `https://api.streamtape.com/remotedl/add?login=${ST_LOGIN}&key=${ST_KEY}&url=${encodeURIComponent(videoUrl)}`;

    try {
        const res = await fetch(remoteUrl);
        const result = await res.json();
        
        if(result.status === 200) {
            uploadedVideoUrl = videoUrl; // Link save ho gaya
            document.getElementById("uploadStatus").innerText = "Transfer Started! Next par click karein.";
            document.getElementById("nextBtn").style.display = "block";
        } else {
            alert("Upload Failed: " + result.msg);
        }
    } catch (e) { alert("Error: " + e.message); }
});

// Navigation
document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

// Publish Logic
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !uploadedVideoUrl) { alert("Title aur Video Link compulsory hai!"); return; }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, description, showBanner,
            video: uploadedVideoUrl, 
            views: 0, 
            createdAt: Date.now()
        });
        alert("Drama Successfully Published!");
        location.reload(); 
    } catch (error) { alert("Error: " + error.message); }
});