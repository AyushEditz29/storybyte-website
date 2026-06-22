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
    if (!videoUrl) { alert("Pehle Google Drive link paste karo!"); return; }
    
    if (videoUrl.includes("/file/d/")) {
        const fileId = videoUrl.split("/d/")[1].split("/")[0];
        videoUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    document.getElementById("uploadStatus").innerText = "Transferring to Streamtape...";
    document.getElementById("uploadBtn").disabled = true;

    try {
        const remoteUrl = `https://api.streamtape.com/remotedl/add?login=${ST_LOGIN}&key=${ST_KEY}&url=${encodeURIComponent(videoUrl)}`;
        const res = await fetch(remoteUrl);
        const result = await res.json();

        if(result.status === 200) {
            const remoteId = result.result.id;
            
            // Loop for Status Check
            const checkStatus = async () => {
                const statusRes = await fetch(`https://api.streamtape.com/remotedl/getstatus?login=${ST_LOGIN}&key=${ST_KEY}&id=${remoteId}`);
                const statusData = await statusRes.json();
                
                if(statusData.result && statusData.result[remoteId] && statusData.result[remoteId].status === "finished") {
                    uploadedVideoUrl = statusData.result[remoteId].url;
                    document.getElementById("uploadStatus").innerText = "Upload Completed!";
                    document.getElementById("nextBtn").style.display = "block";
                } else {
                    document.getElementById("uploadStatus").innerText = "Still processing... waiting...";
                    setTimeout(checkStatus, 5000); 
                }
            };
            checkStatus();
        } else { 
            alert("Failed: " + result.msg); 
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
        
        const nextStep = confirm("Kya aap Dashboard (Delete karne) par jana chahte hain?");
        if (nextStep) {
            window.location.href = "dashboard.html";
        } else {
            location.reload();
        }
    } catch (error) { alert("Error: " + error.message); }
});