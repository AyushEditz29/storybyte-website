import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const dramaId = urlParams.get('id');

// Drama Load Logic
async function loadDrama() {
    if (!dramaId) return;
    
    try {
        const docRef = doc(db, "dramas", dramaId);
        await updateDoc(docRef, { views: increment(1) });
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById("dramaTitle").innerText = data.title;
            document.getElementById("dramaStory").innerText = data.description;
            document.getElementById("viewCount").innerText = (data.views + 1) + " Views";
            
            const playerElement = document.getElementById("player");
            playerElement.src = data.video; 
            
            // Plyr Initialization with Force Delay
            setTimeout(() => {
                if (window.Plyr) {
                    new window.Plyr('#player', {
                        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
                    });
                    console.log("Plyr UI Attached!");
                }
            }, 500);
            
            loadRelatedDramas(data.category);
        }
    } catch (error) { console.error("Error:", error); }
}

async function loadRelatedDramas(category) {
    const snap = await getDocs(collection(db, "dramas"));
    const relatedBox = document.getElementById("relatedCards");
    if (!relatedBox) return;

    relatedBox.innerHTML = "";
    snap.forEach(doc => {
        const drama = doc.data();
        if(drama.category === category && doc.id !== dramaId) {
            relatedBox.innerHTML += `
                <a href="drama.html?id=${doc.id}">
                    <div class="card">
                        <img src="${drama.poster}" alt="${drama.title}">
                        <h3>${drama.title}</h3>
                    </div>
                </a>`;
        }
    });
}

// Initial Call
document.addEventListener("DOMContentLoaded", loadDrama);