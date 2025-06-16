const axios = require('axios');

// ✅ Updated & fallback API added
const getImgurApi = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json");
    return base.data.csb || "https://csb-api.onrender.com"; // fallback API
  } catch (err) {
    console.warn("❌ API fetch failed, using fallback API");
    return "https://csb-api.onrender.com";
  }
};

module.exports = {
  config: {
    name: "imgur",
    version: "1.1.0",
    role: 0,
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    shortDescription: "Upload image to Imgur",
    countDown: 0,
    category: "imgur",
    guide: {
      en: '[reply to image to upload to Imgur]'
    }
  },

  onStart: async ({ api, event }) => {
    let imageUrl;

    if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (event.attachments?.length > 0) {
      imageUrl = event.attachments[0].url;
    } else {
      return api.sendMessage('🖼️ দয়া করে কোনো ছবিতে রিপ্লাই দিন অথবা ছবি আপলোড করুন।', event.threadID, event.messageID);
    }

    try {
      const apiUrl = await getImgurApi();
      const res = await axios.get(`${apiUrl}/nazrul/imgur?link=${encodeURIComponent(imageUrl)}`);

      if (!res.data || !res.data.uploaded || !res.data.uploaded.image) {
        return api.sendMessage("⚠️ ইমেজ আপলোড হয়নি। আবার চেষ্টা করুন।", event.threadID, event.messageID);
      }

      const uploadedLink = res.data.uploaded.image;
      return api.sendMessage(`✅ আপলোড সম্পন্ন:

🔗 ${uploadedLink}`, event.threadID, event.messageID);

    } catch (error) {
      console.error("❌ Imgur upload error:", error);
      return api.sendMessage("🚫 ইমেজ আপলোড করার সময় সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  }
};
