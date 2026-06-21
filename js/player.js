// StoryByte Player

console.log("Player Ready");

const watchBtn = document.getElementById("watchBtn");

const playerBox = document.getElementById("playerBox");

const frame = document.getElementById("streamtapeFrame");

if(watchBtn){

watchBtn.addEventListener("click",()=>{

// Monetag yahan baad me aayega

playerBox.style.display="block";

watchBtn.style.display="none";

});

}


import { initializeApp }

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

collection,

getDocs

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


async function loadRelatedDramas(){

const snap=

await getDocs(

collection(db,"dramas")

);

const relatedBox=

document.getElementById("relatedCards");


if(!relatedBox){

return;

}


relatedBox.innerHTML="";


let count=0;


snap.forEach(doc=>{

const drama=

doc.data();


if(count<4){

relatedBox.innerHTML+=`

<a href="drama.html">

<div class="card">

<img src="${drama.poster}">

<h3>${drama.title}</h3>

</div>

</a>

`;

count++;

}

});

}

loadRelatedDramas();
