import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs
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

// Helper function to encode dynamic paths through ad.html timer
function getAdRoute(targetPage) {
    return `ad.html?next=${encodeURIComponent(targetPage)}`; //
}

// Trending
async function loadTrending(){
    try{
        const q = query(
            collection(db, "dramas"),
            orderBy("views", "desc"),
            limit(4)
        );
        const snapshot = await getDocs(q);
        const container = document.getElementById("trendingCards");
        if(!container) return;
        container.innerHTML = "";
        
        snapshot.forEach(doc => {
            const d = doc.data();
            const targetLink = `drama.html?id=${doc.id}`;
            
            // Redirecting link through ad timer routing
            container.innerHTML += `
                <a href="${getAdRoute(targetLink)}"> <!--[cite: 1] -->
                    <div class="card">
                        <img src="${d.poster}" alt="${d.title}">
                    </div>
                </a>
            `;
        });
    } catch(e) {
        console.log(e);
    }
}

// Latest
async function loadLatest(){
    try{
        const q = query(
            collection(db, "dramas"),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const snapshot = await getDocs(q);
        const container = document.getElementById("latestCards");
        if(!container) return;
        container.innerHTML = "";
        
        snapshot.forEach(doc => {
            const d = doc.data();
            const targetLink = `drama.html?id=${doc.id}`;
            
            // Redirecting link through ad timer routing
            container.innerHTML += `
                <a href="${getAdRoute(targetLink)}"> <!--[cite: 1] -->
                    <div class="card">
                        <img src="${d.poster}" alt="${d.title}">
                        <h3>${d.title}</h3>
                    </div>
                </a>
            `;
        });
    } catch(e) {
        console.log(e);
    }
}

// Banner
async function loadBanner(){
    try{
        const q = query(
            collection(db, "dramas"),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const snapshot = await getDocs(q);
        const banners = [];
        
        snapshot.forEach(doc => {
            const d = doc.data();
            if(d.showBanner === true){
                const targetLink = `drama.html?id=${doc.id}`;
                banners.push({
                    img: d.banner,
                    link: getAdRoute(targetLink) // Banners routed via ad timer[cite: 1]
                });
            }
        });
        
        if(banners.length === 0) return;
        const heroBanner = document.getElementById("heroBanner");
        const bannerLink = document.getElementById("bannerLink");
        let current = 0;

        // FIRST BANNER
        heroBanner.src = banners[0].img;
        bannerLink.href = banners[0].link;

        // AUTO SLIDE
        setInterval(() => {
            current++;
            if(current >= banners.length){
                current = 0;
            }
            heroBanner.src = banners[current].img;
            bannerLink.href = banners[current].link;
        }, 5000);
    } catch(e) {
        console.log(e);
    }
}

// Category filter list
async function loadCategory(category){
    try {
        const snapshot = await getDocs(collection(db, "dramas"));
        const container = document.getElementById("categoryCards");
        if(!container) return;
        container.innerHTML = "";
        
        snapshot.forEach(doc => {
            const d = doc.data();
            if(d.category === category){
                const targetLink = `drama.html?id=${doc.id}`;
                
                // Redirecting categories via ad timer
                container.innerHTML += `
                    <a href="${getAdRoute(targetLink)}"> <!--[cite: 1] -->
                        <div class="card">
                            <img src="${d.poster}" alt="${d.title}">
                            <h3>${d.title}</h3>
                        </div>
                    </a>
                `;
            }
        });
    } catch(e) {
        console.log(e);
    }
}

// ====================
// 📱 ANDROID APP DOWNLOAD WITH TIMER AD
// ====================
function initAppDownload() {
    const appDownloadBtn = document.getElementById("appDownloadBtn");
    if (appDownloadBtn) {
        appDownloadBtn.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Local path configuration for your application apk
            const appApkUrl = "root/Videos/StoryByte.apk"; 
            
            // Redirecting application downloads to timer ad page
            window.location.href = getAdRoute(appApkUrl); //[cite: 1]
        });
    }
}

// START RUNTIME LISTENER
document.addEventListener("DOMContentLoaded", () => {
    loadTrending();
    loadLatest();
    loadBanner();
    initAppDownload(); // App download ad link initialize kiya
});

document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.cat;
        if(category === "All"){
            loadLatest();
            return;
        }
        loadCategory(category);
    });
});

const searchInput = document.querySelector(".search-box input");
if(searchInput) {
    searchInput.addEventListener("keyup", () => {
        const value = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll("#latestCards .card");
        cards.forEach(card => {
            const title = card.querySelector("h3").innerText.toLowerCase();
            if(title.includes(value)){
                card.parentElement.style.display = "block";
            } else {
                card.parentElement.style.display = "none";
            }
        });
    });
}