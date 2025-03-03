const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public")); // Static files directory

// Route to generate unique profile page with QR code
app.post("/create-profile", async (req, res) => {
    const { username } = req.body; // Assume each user has a unique username
    if (!username) {
        return res.status(400).send("Username is required.");
    }

    try {
        const profilePagePath = path.join(__dirname, "public", `${username}.html`);
        const profileUrl = `http://yourwebsite.com/${username}`; // Adjust domain

        // Generate QR Code
        const qrCodePath = path.join(__dirname, "public", "qrcodes", `${username}.png`);
        await QRCode.toFile(qrCodePath, profileUrl, {
            width: 300,
        });

        // Create profile HTML with QR code
        const profileHtml = `
<!DOCTYPE html>
<html>
    <head>
        <title>${username}'s Profile</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>Welcome to ${username}'s Profile</h1>
        <p>Scan the QR code below to visit this page:</p>
        <img src="qrcodes/${username}.png" alt="QR Code">
    </body>
</html>`;

        // Save profile page
        fs.writeFileSync(profilePagePath, profileHtml);

        res.status(201).send({ message: "Profile page created!", profileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to create profile.");
    }
});

// Serve the app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));