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

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) { alert("Login Error: " + error.message); }
});

// Remote Upload
document.getElementById("uploadBtn").addEventListener("click", async () => {
    const videoUrl = document.getElementById("manualVideoUrl").value;
    if (!videoUrl) { alert("Link paste karo!"); return; }

    document.getElementById("uploadStatus").innerText = "Transferring... please wait...";
    const remoteUrl = `https://api.streamtape.com/remotedl/add?login=${ST_LOGIN}&key=${ST_KEY}&url=${encodeURIComponent(videoUrl)}`;

    try {
        const res = await fetch(remoteUrl);
        const result = await res.json();
        if(result.status === 200) {
            uploadedVideoUrl = videoUrl;
            document.getElementById("uploadStatus").innerText = "Transfer Started! Next par click karein.";
            document.getElementById("nextBtn").style.display = "block";
        } else { alert("Failed: " + result.msg); }
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
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !uploadedVideoUrl) { alert("Sab fill karo!"); return; }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, description, showBanner,
            video: uploadedVideoUrl, views: 0, createdAt: Date.now()
        });
        alert("Drama Published!");
        location.reload(); 
    } catch (error) { alert("Error: " + error.message); }
});