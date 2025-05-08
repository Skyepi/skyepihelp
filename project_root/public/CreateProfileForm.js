import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

const firebaseConfig = { 
  /* your config */ 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const profileImage = formData.get("profileImage");

    let profileImageUrl = "";
    if (profileImage && profileImage.size > 0) {
        const profileImgRef = ref(storage, `profileImages/${Date.now()}_${profileImage.name}`);
        await uploadBytes(profileImgRef, profileImage);
        profileImageUrl = await getDownloadURL(profileImgRef);
    }

    const tempDoc = await addDoc(collection(db, "profiles"), {}); // create doc to get ID

    // Generate QR Code for profile URL
    const qrCanvas = document.createElement('canvas');
    const profileURL = `${window.location.origin}/user-profile?id=${tempDoc.id}`;
    new QRCode(qrCanvas, { text: profileURL, width: 300, height: 300 });

    // Upload QR code image
    const blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
    const qrImgRef = ref(storage, `qrCodes/${tempDoc.id}.png`);
    await uploadBytes(qrImgRef, blob);
    const qrCodeUrl = await getDownloadURL(qrImgRef);

    const profileData = {
        govName: formData.get("govName"),
        preferredName: formData.get("preferredName"),
        shelterName: formData.get("shelterName"),
        shelterAddress: formData.get("shelterAddress"),
        bio: formData.get("bio"),
        paymentMethod: formData.get("paymentMethod"),
        paymentInfo: formData.get("paymentInfo"),
        phrase: formData.get("phrase"),
        profileImageUrl: profileImageUrl,
        qrCodeUrl: qrCodeUrl,
    };

    // Update the temp doc with real data
    await addDoc(collection(db, "profiles"), profileData);

    alert("Profile created successfully!");
    window.location.href = `/user-profile?id=${tempDoc.id}`;
});
