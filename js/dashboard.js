// dashboard.js
import { getFirestore, collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const db = getFirestore();

async function renderAdminList() {
    const querySnapshot = await getDocs(collection(db, "dramas"));
    const container = document.getElementById("adminList");
    container.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        container.innerHTML += `
            <div class="admin-item" style="border:1px solid #333; padding:10px; margin-bottom:10px;">
                <p><strong>${d.title}</strong></p>
                <button onclick="deleteDrama('${docSnap.id}')" style="background:red;">Delete</button>
            </div>
        `;
    });
}

// Delete function yahi rehna chahiye
window.deleteDrama = async (id) => {
    await deleteDoc(doc(db, "dramas", id));
    location.reload();
};

renderAdminList();