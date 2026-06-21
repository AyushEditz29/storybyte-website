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

// 1. LOGIN LOGIC
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
});

// 2. UPLOAD TO NEXT (Transition Logic)
document.getElementById("nextBtn").addEventListener("click", () => {
    document.getElementById("uploadPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
});

// 3. PUBLISH DRAMA LOGIC
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const video = document.getElementById("video").value;
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !video) { 
        alert("Drama Name aur Video URL compulsory hain!"); 
        return; 
    }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, video, description, showBanner, 
            views: 0, 
            createdAt: Date.now()
        });
        alert("Drama Successfully Published to Database!");
        // Form clear karne ke liye
        document.getElementById("title").value = "";
        document.getElementById("video").value = "";
    } catch (error) {
        alert("Error: " + error.message);
    }
});