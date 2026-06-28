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

        // Views automatic update increment counter
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
            // 🎯 FORCED DIRECT 1080P DOWNLOAD HANDLER (BLOB BYPASS)
            // ====================
            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    
                    if (videoSource && videoSource.includes("playlist.m3u8")) {
                        const directMp4Url = videoSource.replace("playlist.m3u8", "play_1080p.mp4");
                        
                        // Button state change taaki user ko pata chale downloading shuru ho gayi h
                        const originalText = downloadBtn.innerText;
                        downloadBtn.innerText = "⏳ Downloading...";
                        downloadBtn.style.opacity = "0.6";

                        try {
                            // Fetch request browser bypass lagayega taaki player na khule
                            const response = await fetch(directMp4Url);
                            if (!response.ok) throw new Error("Network response error");

                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = `${data.title || "StoryByte_1080p"}.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            
                            // Cleanup resources
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(blobUrl);
                        } catch (error) {
                            console.error("Direct blob trigger failed, using anchor method...", error);
                            // Fallback: Agar browser fetch security block kare toh normal clean link open hoga
                            window.open(directMp4Url, "_blank");
                        } finally {
                            downloadBtn.innerText = originalText;
                            downloadBtn.style.opacity = "1";
                        }
                    }
                });
            }

            // ====================
            // ⚙️ PLYR INITIALIZATION CONTROL
            // ====================
            playerInstance = new Plyr("#player", {
                ratio: "9:16",
                controls: [
                    "play-large", "play", "progress", "current-time", 
                    "mute", "volume", "settings", "fullscreen"
                ],
                settings: ["quality", "speed"]
            });

            // HLS Parsing with structural dynamic options injection
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(videoElement);
                
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    // Bunny se dynamic standard resolution levels access karna
                    const availableQualities = hlsInstance.levels.map((l) => l.height);
                    
                    if (availableQualities && availableQualities.length > 0) {
                        availableQualities.unshift(0); // Add Auto mode index

                        // Overwriting original configuration settings options arrays directly
                        playerInstance.config.quality = {
                            default: 0,
                            options: availableQualities,
                            forced: true,
                            onChange: (e) => updateQuality(e),
                        };
                    }
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
                // For Native Apple iOS platforms
                videoElement.src = videoSource;
                playerInstance.play();
            }
            
            loadRelatedDramas(data.category);
        }
    }
    catch(error){
        console.error("Error loading drama:", error);
    }
}

// Quality switching router map
function updateQuality(newQuality) {
    if (!hlsInstance) return;
    
    if (newQuality === 0) {
        hlsInstance.currentLevel = -1; // Auto system settings tracking override
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