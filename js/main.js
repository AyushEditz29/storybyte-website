import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

async function loadContent() {
    const dramaContainer = document.getElementById("dramaContainer");
    const bannerContainer = document.getElementById("bannerContainer"); // Banner ke liye
    const q = query(collection(db, "dramas"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    dramaContainer.innerHTML = ""; 
    if(bannerContainer) bannerContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // 1. All Dramas Grid
        const dramaCard = `
            <div class="card" onclick="window.location.href='drama.html?id=${doc.id}'">
                <img src="${data.poster}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p>${data.category}</p>
            </div>
        `;
        dramaContainer.innerHTML += dramaCard;

        // 2. Banner Logic (Agar showBanner tick hai)
        if (data.showBanner && bannerContainer) {
            const bannerItem = `
                <div class="banner-item" onclick="window.location.href='drama.html?id=${doc.id}'">
                    <img src="${data.banner}" alt="${data.title}">
                </div>
            `;
            bannerContainer.innerHTML += bannerItem;
        }
    });
}

// Page load hote hi load karo
loadContent();