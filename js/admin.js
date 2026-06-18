import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 👇 Yahan apna firebaseConfig paste karna

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


document
.getElementById("publishBtn")
.addEventListener("click", async()=>{

const title =
document.getElementById("title").value;

const category =
document.getElementById("category").value;

const poster =
document.getElementById("poster").value;

const banner =
document.getElementById("banner").value;

const video =
document.getElementById("video").value;

const description =
document.getElementById("description").value;


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