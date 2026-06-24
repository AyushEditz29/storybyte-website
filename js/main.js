import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
query,
orderBy,
limit,
getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey:"AIzaSyCsGRspc2VB-xJq5XtmmkPKqOU90cdvvVI",

authDomain:"storybyteappin.firebaseapp.com",

projectId:"storybyteappin",

storageBucket:"storybyteappin.firebasestorage.app",

messagingSenderId:"113135240391",

appId:"1:113135240391:web:53586b59385268dfefeae2"

};

const app=initializeApp(firebaseConfig);

const db=getFirestore(app);



// Trending

async function loadTrending(){

try{

const q=query(

collection(db,"dramas"),

orderBy("views","desc"),

limit(4)

);

const snapshot=await getDocs(q);

const container=

document.getElementById("trendingCards");

if(!container)return;

container.innerHTML="";

snapshot.forEach(doc=>{

const d=doc.data();

container.innerHTML+=`

<a href="drama.html?id=${doc.id}">

<div class="card">

<img src="${d.poster}" alt="${d.title}">

</div>

</a>

`;

});

}catch(e){

console.log(e);

}

}



// Latest

async function loadLatest(){

try{

const q=query(

collection(db,"dramas"),

orderBy("createdAt","desc"),

limit(10)

);

const snapshot=await getDocs(q);

const container=

document.getElementById("latestCards");

if(!container)return;

container.innerHTML="";

snapshot.forEach(doc=>{

const d=doc.data();

container.innerHTML+=`

<a href="drama.html?id=${doc.id}">

<div class="card">

<img src="${d.poster}" alt="${d.title}">

<h3>${d.title}</h3>

</div>

</a>

`;

});

}catch(e){

console.log(e);

}

}



// Banner

async function loadBanner(){

try{

const q=query(

collection(db,"dramas"),

orderBy("createdAt","desc"),

limit(20)

);

const snapshot=

await getDocs(q);

const banners=[];

snapshot.forEach(doc=>{

const d=doc.data();

if(d.showBanner===true){

banners.push({

img:d.banner,

link:`drama.html?id=${doc.id}`

});

}

});

if(banners.length===0)return;

const heroBanner=

document.getElementById("heroBanner");

const bannerLink=

document.getElementById("bannerLink");

let current=0;


// FIRST BANNER

heroBanner.src=

banners[0].img;

bannerLink.href=

banners[0].link;


// AUTO SLIDE

setInterval(()=>{

current++;

if(current>=banners.length){

current=0;

}

heroBanner.src=

banners[current].img;

bannerLink.href=

banners[current].link;

},5000);

}catch(e){

console.log(e);

}

}



// START

document.addEventListener(

"DOMContentLoaded",

()=>{

loadTrending();

loadLatest();

loadBanner();

}

);

async function loadCategory(category){

const snapshot=

await getDocs(collection(db,"dramas"));

const container=

document.getElementById("latestCards");

container.innerHTML="";

snapshot.forEach(doc=>{

const d=doc.data();

if(d.category===category){

container.innerHTML+=`

<a href="drama.html?id=${doc.id}">

<div class="card">

<img src="${d.poster}" alt="${d.title}">

<h3>${d.title}</h3>

</div>

</a>

`;

}

});

}
document.querySelectorAll(".cat-btn")

.forEach(btn=>{

btn.addEventListener("click",()=>{

const category=

btn.dataset.cat;

loadCategory(category);

});

});

if(category==="All"){
loadLatest();
return;
}

const searchInput=

document.querySelector(

".search-box input"

);

searchInput.addEventListener(

"keyup",

()=>{

const value=

searchInput.value

.toLowerCase();

const cards=

document.querySelectorAll(

"#latestCards .card"

);

cards.forEach(card=>{

const title=

card.querySelector("h3")

.innerText

.toLowerCase();

if(title.includes(value)){

card.parentElement

.style.display="block";

}

else{

card.parentElement

.style.display="none";

}

});

});