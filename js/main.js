import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Trending Videos (Most Watched - limit 4)
async function loadTrending() {
    try {
        const q = query(collection(db, "dramas"), orderBy("views", "desc"), limit(4));
        const snapshot = await getDocs(q);
        const container = document.getElementById("trendingCards");
        if (!container) return;
        
        container.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            container.innerHTML += `
                <a href="drama.html?id=${doc.id}">
                    <div class="card">
                        <img src="${d.poster}" alt="${d.title}">
                    </div>
                </a>`;
        });
    } catch (e) { console.error("Error Trending:", e); }
}

// Latest Uploads (Newest - limit 10)
async function loadLatest() {
    try {
        const q = query(collection(db, "dramas"), orderBy("createdAt", "desc"), limit(10));
        const snapshot = await getDocs(q);
        const container = document.getElementById("latestCards");
        if (!container) return;

        container.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            container.innerHTML += `
                <a href="drama.html?id=${doc.id}">
                    <div class="card">
                        <img src="${d.poster}" alt="${d.title}">
                        <h3>${d.title}</h3>
                    </div>
                </a>`;
        });
    } catch (e) { console.error("Error Latest:", e); }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    loadTrending();
    loadLatest();
});