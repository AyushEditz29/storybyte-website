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