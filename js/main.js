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

const viewAllBtn = document.getElementById("viewAllBtn");

const extraStories = document.getElementById("extraStories");

if(viewAllBtn && extraStories){

viewAllBtn.addEventListener("click",()=>{

extraStories.classList.toggle("hidden");

if(extraStories.classList.contains("hidden")){

viewAllBtn.innerText="View All Dramas →";

}

else{

viewAllBtn.innerText="Show Less ↑";

}

});

}
const banners=[

{

img:"images/banner1.jpg",

link:"waqt-ka-karz.html"

},

{

img:"images/banner2.jpg",

link:"king-ki-queen.html"

},

{

img:"images/banner3.jpg",

link:"drama.html"

},

{

img:"images/banner4.jpg",

link:"drama.html"

}

];

let current=0;

const heroBanner=document.getElementById("heroBanner");

const bannerLink=document.getElementById("bannerLink");

if(heroBanner){

setInterval(()=>{

current++;

if(current>=banners.length){

current=0;

}

heroBanner.src=banners[current].img;

bannerLink.href=banners[current].link;

},5000);

}