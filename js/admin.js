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

// Yahan apni Streamtape details daalo (IMPORTANT)
const ST_LOGIN = "storybyte029@gmail.com"; 
const ST_KEY = "Qazqwk3bAWf0Q4r";

let uploadedVideoUrl = ""; 

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

// 2. DIRECT UPLOAD TO STREAMTAPE
document.getElementById("uploadBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("videoFile");
    const file = fileInput.files[0];
    if (!file) { alert("Pehle video select karo!"); return; }

    document.getElementById("uploadStatus").innerText = "Uploading to Streamtape... please wait...";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("login", ST_LOGIN);
    formData.append("key", ST_KEY);

    try {
        const res = await fetch("https://api.streamtape.com/file/ul", { method: "POST", body: formData });
        const result = await res.json();
        
        if(result.status === 200) {
            uploadedVideoUrl = result.result.url; 
            document.getElementById("uploadStatus").innerText = "Upload Successful!";
            document.getElementById("nextBtn").style.display = "block";
        } else {
            alert("Upload Failed! Check API Key/Login.");
        }
    } catch (e) { alert("Error: " + e.message); }
});

// 3. NEXT
document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

// 4. PUBLISH
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !uploadedVideoUrl) { alert("Drama Title aur Video Upload compulsory hai!"); return; }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, description, showBanner,
            video: uploadedVideoUrl, 
            views: 0, 
            createdAt: Date.now()
        });
        alert("Drama Successfully Published!");
        location.reload(); 
    } catch (error) { alert("Error saving to database: " + error.message); }
});