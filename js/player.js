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
            // DOWNLOAD BUTTON HANDLER
            // ====================
            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    
                    if (videoSource && videoSource.includes("playlist.m3u8")) {
                        // 1080p FHD download ke liye play_1080p.mp4 target kiya hai
                        const directMp4Url = videoSource.replace("playlist.m3u8", "play_1080p.mp4"); 
                        
                        try {
                            const response = await fetch(directMp4Url);
                            if (!response.ok) throw new Error("1080p file not available");
                            
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = `${document.getElementById("dramaTitle").innerText || "StoryByte_1080p"}.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(blobUrl);
                            console.log("Direct 1080p Download Started! 🚀");
                        } catch (error) {
                            console.error("Blob download failed, opening fallback in new tab...", error);
                            window.open(directMp4Url, "_blank");
                        }
                    }
                });
            }
            
           // ====================
            // ⚙️ PLYR INITIALIZATION (FIXED FOR QUALITY)
            // ====================
            const player = new Plyr("#player", {
                ratio: "9:16", // Vertical layout configuration
                controls: [
                    "play-large", "play", "progress", "current-time", 
                    "mute", "volume", "settings", "fullscreen"
                ],
                settings: ["quality", "speed"],
                quality: {
                    default: 0,
                    options: [0], 
                    forced: true,
                    onChange: (e) => updateQuality(e)
                }
            });
                
            
            // HLS Stream Controller + Dynamic Quality Menu
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(videoElement);
                
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    setTimeout(() => {
                        const availableQualities = hlsInstance.levels.map((l) => l.height);
                        
                        if (availableQualities.length > 0) {
                            availableQualities.unshift(0); // 0 translates to 'Auto'
                            player.config.quality.options = availableQualities;
                            player.setup(); // Controls refresh trigger
                        }
                    }, 300);
                   
                    player.play();
                });

                // Global network/media errors fallback integration
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
                player.play();
            } else {
                // Fallback MP4 target setup
                player.source = {
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

// Quality mapping adjustment parser function
function updateQuality(newQuality) {
    if (!hlsInstance) return;
    
    if (newQuality === 0) {
        hlsInstance.currentLevel = -1; // Default to Auto tracking mode
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

// DOM Init trigger callback
document.addEventListener("DOMContentLoaded", loadDrama);