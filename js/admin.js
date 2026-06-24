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
// REMOTE UPLOAD
// ====================

document.getElementById("uploadBtn")
.addEventListener("click",async()=>{

const videoUrl=
document.getElementById("manualVideoUrl")
.value.trim();

const statusEl=
document.getElementById("uploadStatus");

const linkEl=
document.getElementById("generatedLink");


if(!videoUrl){

alert("Video URL paste karo ❌");

return;

}


statusEl.innerText=
"⏳ Upload Starting...";


try{


const response=
await fetch(

WORKER_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

action:"upload",

url:videoUrl

})

}

);


const data=
await response.json();

console.log(data);


if(data.status!==200){

statusEl.innerText=
"❌ Upload Error";

return;

}


const remoteId=

data?.result?.id ||

data?.id;


if(!remoteId){

statusEl.innerText=
"❌ Remote ID Missing";

return;

}


// ====================
// CHECK STATUS
// ====================

const checkStatus=async()=>{


const response=

await fetch(

WORKER_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

action:"status",

id:remoteId

})

}

);


const statusData=

await response.json();

console.log(statusData);


let item=


statusData.result

?

(

statusData.result[remoteId]

||

Object.values(

statusData.result

)[0]

)

:

null;


if(

item &&

(

item.status==="finished"

||

item.status==="success"

||

item.status==="completed"

)

){

linkEl.value=

item.url

||

item.link

||

"";


statusEl.innerText=

"✅ Upload Completed";


}

else{


statusEl.innerText=

"⏳ Processing...";


setTimeout(

checkStatus,

5000

);


}


};


checkStatus();


}
catch(error){

console.log(error);

statusEl.innerText=

"❌ Upload Failed";

}

});


// ====================
// NEXT
// ====================

document.getElementById("nextBtn")
.addEventListener("click",()=>{

const link=

document.getElementById("generatedLink")
.value;


if(!link){

alert("Upload complete hone do ❌");

return;

}


document.getElementById("finalVideoUrl")
.value=link;


document.getElementById("uploadPanel")
.style.display="none";


document.getElementById("adminPanel")
.style.display="block";

});


// ====================
// PUBLISH
// ====================

document.getElementById("publishBtn")
.addEventListener("click",async()=>{

const title=

document.getElementById("title")
.value;

const video=

document.getElementById("finalVideoUrl")
.value;


if(!title||!video){

alert("Title ya Video missing ❌");

return;

}


try{


await addDoc(

collection(db,"dramas"),

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

video,

views:0,

createdAt:Date.now()

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
