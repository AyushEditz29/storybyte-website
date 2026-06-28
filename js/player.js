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
let playerInstance = null; // Plyr instance globally scope kiya

// ====================
// LOAD DRAMA MAIN FUNCTION
// ====================
async function loadDrama(){
    if(!dramaId) return;

    try{
        const docRef = doc(db, "dramas", dramaId);

        // Views count update trigger
        await updateDoc(docRef, {
            views: increment(1)
        });

        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data();

            document.getElementById("dramaTitle").innerText = data.title;
            document.getElementById("dramaStory").innerText = data.description;
            document.getElementById("viewCount").innerText = (data.views + 1) + " Views";

            // Direct Bunny CDN HLS Link (.m3u8)
            const videoSource = data.videoUrl; 
            const videoElement = document.getElementById("player");

            if(!videoSource) {
                console.error("Firestore me videoUrl missing hai! ❌");
                return;
            }

            // ====================
            // 🎯 1080p DIRECT DOWNLOAD HANDLER (FIXED ROUTE)
            // ====================
            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    
                    if (videoSource && videoSource.includes("playlist.m3u8")) {
                        // Bunny Stream se 1080p direct secure progressive download hit karne ke liye format rewrite
                        const directMp4Url = videoSource.replace("playlist.m3u8", "play_1080p.mp4"); 
                        
                        // Ek temporary anchor tag bana kar safe trigger lagayenge
                        const a = document.createElement("a");
                        a.href = directMp4Url;
                        a.target = "_blank"; // Force trigger download box/new tab fallback
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        console.log("Direct 1080p Download Triggered: ", directMp4Url);
                    }
                });
            }

            // ====================
            // ⚙️ PLYR INITIALIZATION (FIXED)
            // ====================
            playerInstance = new Plyr("#player", {
                ratio: "9:16", // Vertical view setup
                controls: [
                    "play-large", "play", "progress", "current-time", 
                    "mute", "volume", "settings", "fullscreen"
                ],
                settings: ["quality", "speed"],
                quality: {
                    default: 0,
                    options: [0], // Initially Auto setup default rakhenge
                    forced: true,
                    onChange: (e) => updateQuality(e)
                }
            });

            // HLS Stream Controller + Dynamic Quality Menu Loader
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(videoElement);
                
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    setTimeout(() => {
                        // Manifest parse hone ke baad automatic resolutions array fetch hoga
                        const availableQualities = hlsInstance.levels.map((l) => l.height);
                        
                        if (availableQualities.length > 0) {
                            availableQualities.unshift(0); // 0 translates to 'Auto'
                            
                            // Plyr ke active options control settings array ko full update kiya
                            playerInstance.config.quality.options = availableQualities;
                            playerInstance.setup(); // Controls refresh structure force trigger
                        }
                    }, 300); // Quality paths track karne ka standard buffer delay
                    
                    playerInstance.play();
                });

                // Network fallback structural integration
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
                // For Native iOS Safari
                videoElement.src = videoSource;
                playerInstance.play();
            } else {
                // Fallback MP4 target setup
                playerInstance.source = {
                    type: "video",
                    sources: [{ src: videoSource, type: "video/mp4" }]
                };
            }

            loadRelatedDramas(data.category);
        }
    }
    catch(error){
        console.error("Error loading drama:", error);
    }
}

// Quality switching method connection layer
function updateQuality(newQuality) {
    if (!hlsInstance) return;
    
    if (newQuality === 0) {
        hlsInstance.currentLevel = -1; // Switch back to Auto
        console.log("Quality set to Auto");
    } else {
        hlsInstance.levels.forEach((level, levelIndex) => {
            if (level.height === newQuality) {
                hlsInstance.currentLevel = levelIndex;
                console.log("Quality switched to: " + newQuality + "p");
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

// Setup entry trigger
document.addEventListener("DOMContentLoaded", loadDrama);