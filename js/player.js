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

const urlParams = new URLSearchParams(window.location.search);
const dramaId = urlParams.get("id");

let hlsInstance = null; 
let playerInstance = null;

// ====================
// LOAD DRAMA MAIN FUNCTION
// ====================
async function loadDrama(){
    if(!dramaId) return;

    try{
        const docRef = doc(db, "dramas", dramaId);

        await updateDoc(docRef, {
            views: increment(1)
        });

        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data();

            document.getElementById("dramaTitle").innerText = data.title;
            document.getElementById("dramaStory").innerText = data.description;
            document.getElementById("viewCount").innerText = (data.views + 1) + " Views";

            const videoSource = data.videoUrl; 
            const videoElement = document.getElementById("player");

            if(!videoSource) {
                console.error("Firestore me videoUrl missing hai! ❌");
                return;
            }

            // ====================
// Dynamic SEO
// ====================

document.title = `${data.title} | StoryByte`;

document.querySelector('meta[name="description"]')?.setAttribute(
    "content",
    data.description
);

document.querySelector('meta[property="og:title"]')?.setAttribute(
    "content",
    data.title
);

document.querySelector('meta[property="og:description"]')?.setAttribute(
    "content",
    data.description
);

document.querySelector('meta[property="og:image"]')?.setAttribute(
    "content",
    data.poster
);

document.querySelector('link[rel="canonical"]')?.setAttribute(
    "href",
    window.location.href
);

            // ====================
            // 🎯 DOWNLOAD BUTTON HANDLER 
            // ====================
            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    
                    if (videoSource && videoSource.includes("playlist.m3u8")) {
                        const directMp4Url = videoSource.replace(
    "playlist.m3u8",
    "play_1080p.mp4"
);

const workerDownload =
`https://storybyte-adminbot.storybyte029.workers.dev/?action=download&videoUrl=${encodeURIComponent(directMp4Url)}`;

const backUrl = window.location.href;

window.location.href =
`ad.html?type=download&back=${encodeURIComponent(backUrl)}&next=${encodeURIComponent(workerDownload)}`;
                        console.log("Redirecting to Ad page for 1080p download loop...");
                    }
                });
            }

            // ====================
            // ⚙️ PLYR + HLS HARD-SYNCHRONIZATION
            // ====================
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(videoElement);
                
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    const availableQualities = hlsInstance.levels.map((l) => l.height);
                    if (availableQualities.length > 0) {
                        availableQualities.unshift(0); // 0 corresponds to 'Auto'
                    }

                    playerInstance = new Plyr("#player", {
                        ratio: "9:16",
                        controls: [
                            "play-large", "play", "progress", "current-time", 
                            "mute", "volume", "settings", "fullscreen"
                        ],
                        settings: ["quality", "speed"],
                        quality: {
                            default: 0,
                            options: availableQualities.length > 0 ? availableQualities : [0],
                            forced: true,
                            onChange: (e) => updateQuality(e),
                        }
                    });

                    playerInstance.play();
                });

                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hlsInstance.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hlsInstance.recoverMediaError();
                                break;
                            default:
                                break;
                        }
                    }
                });

            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = videoSource;
                playerInstance = new Plyr("#player", {
                    ratio: "9:16",
                    controls: [
                        "play-large", "play", "progress", "current-time", 
                        "mute", "volume", "settings", "fullscreen"
                    ]
                });
                playerInstance.play();
            }
            
            loadRelatedDramas(data.category);
        }
    }
    catch(error){
        console.error("Error loading drama:", error);
    }
}

function updateQuality(newQuality) {
    if (!hlsInstance) return;
    
    if (newQuality === 0) {
        hlsInstance.currentLevel = -1; 
        console.log("Quality configured to Auto");
    } else {
        hlsInstance.levels.forEach((level, levelIndex) => {
            if (level.height === newQuality) {
                hlsInstance.currentLevel = levelIndex;
                console.log("Quality updated to: " + newQuality + "p");
            }
        });
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
               const targetDramaLink = `drama.html?id=${doc.id}`;
                
                relatedBox.innerHTML += `
                    <a href="ad.html?next=${encodeURIComponent(targetDramaLink)}">
                        <div class="card">
                            <img src="${drama.poster}" alt="${drama.title}">
                            <h3>${drama.title}</h3>
                        </div>
                    </a>
                `;
            }
        });

        document.querySelectorAll("#relatedCards img").forEach(img => {
            if(img.complete){
                img.classList.add("loaded");
            }
            img.onload = () => {
                img.classList.add("loaded");
            };
        });
        
    } catch (error) {
        console.error("Error loading related dramas:", error);
    }
}

// Setup entry trigger
document.addEventListener("DOMContentLoaded", loadDrama);