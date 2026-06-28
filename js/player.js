import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ====================
// FIREBASE CONFIG
// ====================
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

const WORKER_URL = "https://storybyte-adminbot.storybyte029.workers.dev";
const urlParams = new URLSearchParams(window.location.search);
const dramaId = urlParams.get("id");

// ====================
// LOAD DRAMA MAIN FUNCTION
// ====================
async function loadDrama(){
    if(!dramaId) return;

    try{
        const docRef = doc(db, "dramas", dramaId);

        // Views count increment
        await updateDoc(docRef, {
            views: increment(1)
        });

        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data();

            document.getElementById("dramaTitle").innerText = data.title;
            document.getElementById("dramaStory").innerText = data.description;
            document.getElementById("viewCount").innerText = (data.views + 1) + " Views";

            // Firestore se direct Bunny Link fetch karenge
            const rawVideoUrl = data.videoUrl; 

            if(!rawVideoUrl) {
                console.error("Firestore me videoUrl missing hai! ❌");
                return;
            }

            // Cloudflare Worker ke zariye Bunny link ko mask kar rahe hain
            const videoSource = `${WORKER_URL}?videoUrl=${encodeURIComponent(rawVideoUrl)}`;
            const videoElement = document.getElementById("player");

            // Plyr.io Initialize (9:16 vertical video ratio)
            const player = new Plyr("#player", {
                ratio: "9:16",
                controls: [
                    "play-large", "play", "progress", "current-time", 
                    "mute", "volume", "settings", "fullscreen"
                ]
            });

            // HLS (.m3u8) Streaming Core Logic
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoSource);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    player.play();
                });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari / iOS native
                videoElement.src = videoSource;
                player.play();
            } else {
                // Fallback option
                player.source = {
                    type: "video",
                    sources: [{ src: videoSource, type: "video/mp4" }]
                };
            }

            // Related dramas load karenge
            loadRelatedDramas(data.category);
        }
    }
    catch(error){
        console.error("Error loading drama:", error);
    }
}

// ====================
// LOAD RELATED DRAMAS
// ====================
async function loadRelatedDramas(category){
    try {
        const snap = await getDocs(collection(db, "dramas"));
        const relatedBox = document.getElementById("relatedCards");
        relatedBox.innerHTML = "";

        snap.forEach(doc => {
            const drama = doc.data();
            if(drama.category === category && doc.id !== dramaId){
                relatedBox.innerHTML += `
                    <a href="drama.html?id=${doc.id}">
                        <div class="card">
                            <img src="${drama.poster}">
                            <h3>${drama.title}</h3>
                        </div>
                    </a>
                `;
            }
        });
    } catch (error) {
        console.error("Error loading related dramas:", error);
    }
}

// Event Listener on Load
document.addEventListener("DOMContentLoaded", loadDrama);