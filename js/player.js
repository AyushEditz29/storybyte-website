import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

doc,

getDoc,

collection,

getDocs,

updateDoc,

increment

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



const firebaseConfig={

apiKey:"AIzaSyCsGRspc2VB-xJq5XtmmkPKqOU90cdvvVI",

authDomain:"storybyteappin.firebaseapp.com",

projectId:"storybyteappin",

storageBucket:"storybyteappin.firebasestorage.app",

messagingSenderId:"113135240391",

appId:"1:113135240391:web:53586b59385268dfefeae2"

};



const app=initializeApp(firebaseConfig);

const db=getFirestore(app);



const urlParams=

new URLSearchParams(

window.location.search

);



const dramaId=

urlParams.get("id");



async function loadDrama(){

if(!dramaId)return;



try{

const docRef=

doc(db,"dramas",dramaId);



await updateDoc(docRef,{

views:increment(1)

});



const docSnap=

await getDoc(docRef);



if(docSnap.exists()){

const data=

docSnap.data();



document.getElementById(

"dramaTitle"

).innerText=data.title;



document.getElementById(

"dramaStory"

).innerText=data.description;



document.getElementById(

"viewCount"

).innerText=

(data.views+1)+" Views";



let streamtapeLink=

data.video;



if(

streamtapeLink.includes("/v/")

){

const videoId=

streamtapeLink

.split("/v/")[1]

.split("/")[0];



streamtapeLink=

`https://streamtape.com/e/${videoId}`;

}



document.getElementById(

"streamtapeFrame"

).src=

streamtapeLink;



loadRelatedDramas(

data.category

);

}

}

catch(error){

console.log(error);

}

}



async function loadRelatedDramas(category){

const snap=

await getDocs(

collection(db,"dramas")

);



const relatedBox=

document.getElementById(

"relatedCards"

);



relatedBox.innerHTML="";



snap.forEach(doc=>{

const drama=

doc.data();



if(

drama.category===category

&&

doc.id!==dramaId

){

relatedBox.innerHTML+=`

<a href="drama.html?id=${doc.id}">

<div class="card">

<img src="${drama.poster}">

<h3>${drama.title}</h3>

</div>

</a>

`;

}

});

}



document.addEventListener(

"DOMContentLoaded",

loadDrama

);

document.addEventListener("DOMContentLoaded",()=>{

const overlay=

document.getElementById("playerOverlay");

if(!overlay)return;

let firstTap=true;

overlay.addEventListener("click",()=>{

if(firstTap){

overlay.style.display="none";

firstTap=false;

}

});

});