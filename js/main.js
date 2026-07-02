// ======================================
// STORYBYTE v1.0
// FIREBASE
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// FIREBASE CONFIG
// ======================================

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


// ======================================
// GLOBAL
// ======================================

let latestDramaList = [];

let bannerList = [];

let currentBanner = 0;


// ======================================
// ROUTES
// ======================================

function adRoute(url){

    return `ad.html?next=${encodeURIComponent(url)}`;

}


// ======================================
// IMAGE LOADER
// ======================================

function enableImageLoader(){

    document.querySelectorAll("img").forEach(img=>{

        if(img.complete){

            img.classList.add("loaded");

        }

        img.onload=()=>{

            img.classList.add("loaded");

        };

    });

}


// ======================================
// SPLASH
// ======================================

function hideSplash(){

    const splash=document.getElementById("splash");

    if(!splash) return;

    setTimeout(()=>{

        splash.style.opacity="0";

        splash.style.pointerEvents="none";

        setTimeout(()=>{

            splash.remove();

        },400);

    },800);

}


// ======================================
// APP DOWNLOAD
// ======================================

function initAppDownload(){

    document.querySelectorAll(".app-btn").forEach(btn=>{

        btn.onclick=(e)=>{

            e.preventDefault();

            window.location.href=adRoute("download.html");

        };

    });

}

// ======================================
// TRENDING
// ======================================

async function loadTrending(){

    try{

        const q=query(

            collection(db,"dramas"),

            orderBy("views","desc"),

            limit(5)

        );

        const snapshot=await getDocs(q);

        const container=document.getElementById("trendingCards");

        if(!container) return;

        container.innerHTML="";

        snapshot.forEach(doc=>{

            const drama=doc.data();

            container.innerHTML+=`

            <a href="${adRoute(`drama.html?id=${doc.id}`)}">

                <div class="card fade-in">

                    <img
                        loading="lazy"
                        src="${drama.poster}"
                        alt="${drama.title}">

                </div>

            </a>

            `;

        });

        enableImageLoader();

    }

    catch(err){

        console.log(err);

    }

}



// ======================================
// LATEST
// ======================================

async function loadLatest(){

    try{

        const q=query(

            collection(db,"dramas"),

            orderBy("createdAt","desc")

        );

        const snapshot=await getDocs(q);

        latestDramaList=[];

        snapshot.forEach(doc=>{

            latestDramaList.push({

                id:doc.id,

                ...doc.data()

            });

        });

        renderLatest(false);

    }

    catch(err){

        console.log(err);

    }

}



// ======================================
// RENDER LATEST
// ======================================

function renderLatest(showAll=false){

    const container=document.getElementById("latestCards");

    if(!container) return;

    container.innerHTML="";

    const list=showAll

        ? latestDramaList

        : latestDramaList.slice(0,4);

    list.forEach(drama=>{

        container.innerHTML+=`

        <a href="${adRoute(`drama.html?id=${drama.id}`)}">

            <div class="card fade-in">

                <img

                    loading="lazy"

                    src="${drama.poster}"

                    alt="${drama.title}">

                <h3>${drama.title}</h3>

            </div>

        </a>

        `;

    });

    enableImageLoader();

}



// ======================================
// VIEW ALL
// ======================================

function initViewAll(){

    const btn=document.getElementById("viewAllBtn");

    if(!btn) return;

    btn.onclick=()=>{

        renderLatest(true);

        btn.style.display="none";

    };

}

// ======================================
// BANNER
// ======================================

async function loadBanner(){

    try{

        const q=query(

            collection(db,"dramas"),

            orderBy("createdAt","desc"),

            limit(5)

        );

        const snapshot=await getDocs(q);

        bannerList=[];

        snapshot.forEach(doc=>{

            const drama=doc.data();

            if(drama.showBanner===true){

                bannerList.push({

                    id:doc.id,

                    banner:drama.banner

                });

            }

        });

        if(bannerList.length===0) return;

        changeBanner();

        setInterval(changeBanner,5000);

    }

    catch(err){

        console.log(err);

    }

}

function changeBanner(){

    const img=document.getElementById("heroBanner");

    const link=document.getElementById("bannerLink");

    if(!img || !link) return;

    const banner=bannerList[currentBanner];

    img.src=banner.banner;

    link.href=adRoute(`drama.html?id=${banner.id}`);

    currentBanner++;

    if(currentBanner>=bannerList.length){

        currentBanner=0;

    }

}



// ======================================
// CATEGORY
// ======================================

async function loadCategory(category){

    try{

        const snapshot=await getDocs(collection(db,"dramas"));

        const container=document.getElementById("categoryCards");

        if(!container) return;

        container.innerHTML="";

        snapshot.forEach(doc=>{

            const drama=doc.data();

            if(drama.category===category){

                container.innerHTML+=`

                <a href="${adRoute(`drama.html?id=${doc.id}`)}">

                    <div class="card fade-in">

                        <img

                        loading="lazy"

                        src="${drama.poster}"

                        alt="${drama.title}">

                        <h3>${drama.title}</h3>

                    </div>

                </a>

                `;

            }

        });

        enableImageLoader();

    }

    catch(err){

        console.log(err);

    }

}

function initCategory(){

    const buttons=document.querySelectorAll(".cat-btn");

    buttons.forEach(btn=>{

        btn.onclick=()=>{

            buttons.forEach(b=>b.classList.remove("active"));

            btn.classList.add("active");

            loadCategory(btn.dataset.cat);

        };

    });

}



// ======================================
// SEARCH
// ======================================

function initSearch(){

    const input=document.querySelector(".search-box input");

    if(!input) return;

    input.onkeyup=()=>{

        const value=input.value.toLowerCase();

        document.querySelectorAll("#latestCards .card").forEach(card=>{

            const title=card.querySelector("h3").innerText.toLowerCase();

            card.parentElement.style.display=

            title.includes(value)

            ? "block"

            : "none";

        });

    };

}



// ======================================
// START
// ======================================

document.addEventListener("DOMContentLoaded",()=>{

    hideSplash();

    loadTrending();

    loadLatest();

    loadBanner();

    initViewAll();

    initCategory();

    initSearch();

    initAppDownload();

});