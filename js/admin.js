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

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("uploadPanel").style.display = "block";
    } catch (error) {
        alert("Wrong Login Details");
    }
});

// PUBLISH
document.getElementById("publishBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const poster = document.getElementById("poster").value;
    const banner = document.getElementById("banner").value;
    const video = document.getElementById("video").value; // Input field se link lenge
    const description = document.getElementById("description").value;
    const showBanner = document.getElementById("showBanner").checked;

    if (!title || !video) { alert("Title and Video URL required"); return; }

    try {
        await addDoc(collection(db, "dramas"), {
            title, category, poster, banner, video, description, showBanner, views: 0, createdAt: Date.now()
        });
        alert("Drama Published!");
    } catch (error) {
        alert("Error: " + error.message);
    }
});

document
.getElementById("nextBtn")
.addEventListener("click",()=>{

const video=

document
.getElementById("video")
.value;

if(!video){

alert("Video URL missing ❌");

return;

}

uploadedVideoUrl=video;

document
.getElementById("uploadPanel")
.style.display="none";

document
.getElementById("adminPanel")
.style.display="block";

});


// ======================
// STREAMTAPE CONNECT
// ======================

document

.getElementById("uploadBtn")

.addEventListener("click",async()=>{

const file=

document

.getElementById("videoFile")

.files[0];


if(!file){

alert("Select MP4 first ❌");

return;

}


document

.getElementById("uploadStatus")

.innerHTML="✅ Ready";


document

.getElementById("nextBtn")

.style.display="block";

});