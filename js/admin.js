import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ====================
// FIREBASE
// ====================

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

const WORKER_URL=
"https://storybyte-streamtape.storybyte029.workers.dev/";


// ====================
// LOGIN
// ====================

document.getElementById("loginBtn")
.addEventListener("click",async()=>{

try{

await signInWithEmailAndPassword(

auth,

document.getElementById("email").value,

document.getElementById("password").value

);

document.getElementById("loginBox")
.style.display="none";

document.getElementById("uploadPanel")
.style.display="block";

}
catch(error){

alert("Login Error ❌");

console.log(error);

}

});


// ====================
// NEXT
// ====================

let telegramLink = "";

document.getElementById("saveLinkBtn")
.addEventListener("click", () => {

    telegramLink =
    document.getElementById("telegramVideoLink")
    .value.trim();

    if(!telegramLink){

        alert("Telegram Link Paste Karo");

        return;
    }

    document.getElementById("uploadStatus")
    .innerText = "✅ Link Saved";

});

document.getElementById("nextBtn")
.addEventListener("click",()=>{

    if(!telegramLink){

        alert("Pehle Link Save Karo");

        return;
    }

    document.getElementById("finalVideoUrl")
    .value = telegramLink;

    document.getElementById("uploadPanel")
    .style.display = "none";

    document.getElementById("adminPanel")
    .style.display = "block";

});


// ====================
// PUBLISH
// ====================

document.getElementById("publishBtn")
.addEventListener("click", async () => {

const title =
document.getElementById("title").value;

const telegramFileId =
document.getElementById("finalVideoUrl").value;

if (!title || !telegramFileId) {

alert("Title ya Telegram File ID missing ❌");
return;

}

try {

await addDoc(
collection(db, "dramas"),
{
title,

category:
document.getElementById("category").value,

poster:
document.getElementById("poster").value,

banner:
document.getElementById("banner").value,

description:
document.getElementById("description").value,

showBanner:
document.getElementById("showBanner").checked,

telegramFileId,

views: 0,

createdAt: Date.now()
}
);

alert("🎉 Drama Published");

location.reload();

}
catch(error){

alert("Publish Error ❌");
console.log(error);

}

});