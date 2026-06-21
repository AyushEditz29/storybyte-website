// StoryByte Main JS

console.log("StoryByte Loaded");

// Search box

const searchInput = document.querySelector(".search-box input");

if(searchInput){

searchInput.addEventListener("keyup", function(){

const value = this.value.toLowerCase();

const cards = document.querySelectorAll(".card");

cards.forEach(card=>{

const title = card.innerText.toLowerCase();

if(title.includes(value)){

card.style.display="block";

}else{

card.style.display="none";

}

});

});

}


// =======================

// View All Dramas

// =======================


const viewAllBtn =

document.getElementById("viewAllBtn");

const allCards =

document.getElementById("allCards");

if(viewAllBtn && allCards){

viewAllBtn.addEventListener("click",()=>{

allCards.classList.toggle("hidden");

if(

allCards.classList.contains("hidden")

){

viewAllBtn.innerText=

"View All Dramas →";

}

else{

viewAllBtn.innerText=

"Show Less ↑";

}

});

}

import { initializeApp }

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

collection,

getDocs,

query,

orderBy,

limit

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig={

apiKey:"AIzaSyCsGRspc2VB-xJq5XtmmkPKqOU90cdvvVI",

authDomain:"storybyteappin.firebaseapp.com",

projectId:"storybyteappin",

storageBucket:"storybyteappin.firebasestorage.app",

messagingSenderId:"113135240391",

appId:"1:113135240391:web:53586b59385268dfefeae2"

};


const app=

initializeApp(firebaseConfig);

const db=

getFirestore(app);


// =====================

// BANNERS

// =====================

async function loadBanner(){

const q=

query(

collection(db,"dramas"),

orderBy("createdAt","desc"),

limit(4)

);

const snap=

await getDocs(q);

const banners=[];


snap.forEach(doc=>{

const data=

doc.data();

if(data.showBanner){

banners.push(data);

}

});


if(!banners.length){

return;

}


let current=0;

const heroBanner=

document.getElementById("heroBanner");

const bannerLink=

document.getElementById("bannerLink");


heroBanner.src=

banners[0].banner;

bannerLink.href=

"drama.html?id="+

banners[0].title;


setInterval(()=>{

current++;

if(current>=banners.length){

current=0;

}


heroBanner.src=

banners[current].banner;


bannerLink.href=

"drama.html?id="+

banners[current].title;

},5000);

}

loadBanner();
