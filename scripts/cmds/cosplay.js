const axios = require('axios');
const fs = require('fs-extra');
const https = require('https');
const path = require('path');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
 fs.mkdirSync(tempDir);
}

module.exports = {
 config: {
   name: "cosplay",
   version: "2.0", // ✅ Updated
   author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
   countDown: 5,
   role: 0,
   shortDescription: {
     en: "Get a random cosplay image.",
     bn: "একটি র‍্যান্ডম কসপ্লে ছবি দেখান।"
   },
   longDescription: {
     en: "Get a random cosplay image along with author credits.",
     bn: "একটি র‍্যান্ডম কসপ্লে ইমেজ পান এবং কার তৈরি তা দেখুন।"
   },
   category: "anime",
   guide: {
     en: "{pn}",
     bn: "{pn}"
   }
 },

 onStart: async function ({ api, event, message }) {
   try {
     // ✅ New reliable cosplay API
     const response = await axios.get('https://nekos.best/api/v2/cosplay');
     const data = response.data;
     const cosplayURL = data.results[0].url;

     const imageFileName = `cosplay_${Date.now()}.jpg`;
     const imagePath = path.join(tempDir, imageFileName);

     const file = fs.createWriteStream(imagePath);
     https.get(cosplayURL, (res) => {
       res.pipe(file);
       file.on('finish', async () => {
         await message.reply({
           body: "💠 Here's a random cosplay image 🧝‍♀️",
           attachment: fs.createReadStream(imagePath)
         });
         fs.unlinkSync(imagePath);
       });
     });
   } catch (error) {
     console.error("❌ Error:", error.message);
     message.reply("⚠️ কসপ্লে ছবি আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
   }
 }
};
