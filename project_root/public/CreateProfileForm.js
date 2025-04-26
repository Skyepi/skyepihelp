import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

const storage = getStorage(app);

profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const profileImage = formData.get("profileImage");

    let profileImageUrl = "";

    if (profileImage && profileImage.size > 0) {
        const storageRef = ref(storage, `profileImages/${Date.now()}_${profileImage.name}`);
        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
    }

    const profileData = {
        govName: formData.get("govName"),
        preferredName: formData.get("preferredName"),
        shelterName: formData.get("shelterName"),
        shelterAddress: formData.get("shelterAddress"),
        bio: formData.get("bio"),
        paymentMethod: formData.get("paymentMethod"),
        paymentInfo: formData.get("paymentInfo"),
        phrase: formData.get("phrase"),
        profileImageUrl: profileImageUrl // Save the uploaded image URL
    };

    try {
        const docRef = await addDoc(collection(db, "profiles"), profileData);
        alert("Profile created successfully!");
        const profileURL = `/user-profile?id=${docRef.id}`;
        generateQRCode(profileURL);
        window.location.href = profileURL;
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});
