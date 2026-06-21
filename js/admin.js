let uploadedVideoUrl = "";

import { initializeApp }

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

collection,

addDoc

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

getAuth,

signInWithEmailAndPassword

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase Config

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

const auth=getAuth(app);


// LOGIN

document

.getElementById("loginBtn")

.addEventListener("click",async()=>{

const email=

document

.getElementById("email")

.value;

const password=

document

.getElementById("password")

.value;

try{

await signInWithEmailAndPassword(

auth,

email,

password

);

document

.getElementById("loginBox")
.style.display="none";

document
.getElementById("uploadPanel")
.style.display="block";

document
.getElementById("adminPanel")
.style.display="none";

}

catch(error){

alert("Wrong Login ❌");

console.log(error);

}

});


// PUBLISH

document

.getElementById("publishBtn")

.addEventListener("click",async()=>{

const title=

document

.getElementById("title")

.value;

const category=

document

.getElementById("category")

.value;

const poster=

document

.getElementById("poster")

.value;

const banner=

document

.getElementById("banner")

.value;

const video=

document

.getElementById("video")

.value;

const description=

document

.getElementById("description")

.value;

const showBanner=

document

.getElementById("showBanner")

.checked;


if(!title){

alert("Drama name required");

return;

}

try{

await addDoc(

collection(db,"dramas"),

{


title,

category,

poster,

banner,

video,

description,

showBanner,

views:0,


createdAt:Date.now()

}

);

alert("Drama Published ✅");

}

catch(error){

alert("Error ❌");

console.log(error);

}

});

document
.getElementById("nextBtn")
.addEventListener("click",()=>{

if(!uploadedVideoUrl){

alert("Upload video first ❌");

return;

}

document
.getElementById("uploadPanel")
.style.display="none";

document
.getElementById("adminPanel")
.style.display="block";

});


// ======================
// STREAMTAPE UPLOAD
// ======================

document
.getElementById("uploadBtn")
.addEventListener("click", async()=>{

const file=

document
.getElementById("videoFile")
.files[0];

if(!file){

alert("Select MP4 first ❌");

return;

}

document
.getElementById("uploadStatus")
.innerHTML="⏳ Preparing upload...";

try{

const response=await fetch(
"https://storybyte-streamtape.storybyte029.workers.dev/"
);

const data=await response.json();

console.log(data);

document
.getElementById("uploadStatus")
.innerHTML="✅ Worker Connected";


// TEMPORARY DEMO

uploadedVideoUrl=

"https://streamtape.com/e/demo123";

document
.getElementById("video")
.value=

uploadedVideoUrl;

document
.getElementById("nextBtn")
.style.display="block";

}
catch(error){

console.log(error);

document
.getElementById("uploadStatus")
.innerHTML="❌ Upload Failed";

}

});


// ======================
// STREAMTAPE CONNECT
// ======================

document

.getElementById("uploadBtn")

.addEventListener("click",async()=>{

const file=

document

.getElementById("videoFile")

.files[0];


if(!file){

alert("Select MP4 first ❌");

return;

}


document

.getElementById("uploadStatus")

.innerHTML="⏳ Connecting...";


try{

const response=

await fetch(

"https://storybyte-streamtape.storybyte029.workers.dev/",

{

method:"POST"

}

);


const data=

await response.json();


document

.getElementById("uploadStatus")

.innerHTML=

"✅ Connected";


document

.getElementById("nextBtn")

.style.display="block";


console.log(data);

}

catch(error){

console.log(error);


document

.getElementById("uploadStatus")

.innerHTML=

"❌ Connection Failed";

}

});

