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

let videoUrlToPublish = ""; // Global variable link save karne ke liye

// 1. LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) { alert("Login Error: " + error.message); }
});

// 2. SET LINK & GO NEXT
document.getElementById("setLinkBtn").addEventListener("click", () => {
    videoUrlToPublish = document.getElementById("manualVideoUrl").value;
    if(videoUrlToPublish) {
        alert("Link Saved!");
        document.getElementById("nextBtn").style.display = "block";
    } else { alert("Pehle Link Paste Karo!"); }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

// 3. PUBLISH
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !videoUrlToPublish) { alert("Title aur Video URL compulsory hai!"); return; }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, description, showBanner,
            video: videoUrlToPublish, 
            views: 0, 
            createdAt: Date.now()
        });
        alert("Drama Successfully Published!");
        location.reload(); // Page refresh to reset
    } catch (error) { alert("Error: " + error.message); }
});