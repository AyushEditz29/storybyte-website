```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,

collection,

addDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase Config

const firebaseConfig = {

apiKey: "AIzaSyCsGRspc2VB-xJq5XtmmkPKqOU90cdvvVI",

authDomain: "storybyteappin.firebaseapp.com",

projectId: "storybyteappin",

storageBucket: "storybyteappin.firebasestorage.app",

messagingSenderId: "113135240391",

appId: "1:113135240391:web:53586b59385268dfefeae2"

};
```

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


document

.getElementById("publishBtn")

.addEventListener("click", async()=>{


const title=

document.getElementById("title").value;


const category=

document.getElementById("category").value;


const poster=

document.getElementById("poster").value;


const banner=

document.getElementById("banner").value;


const video=

document.getElementById("video").value;


const description=

document.getElementById("description").value;


const trending=

document.getElementById("trending").checked;


const latest=

document.getElementById("latest").checked;


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

trending,

latest,

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
