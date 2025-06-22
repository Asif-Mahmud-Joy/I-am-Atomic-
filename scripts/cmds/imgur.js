const axios = require('axios');

const API_ENDPOINTS = [
  "https://csb-api.onrender.com/nazrul/imgur",
  "https://nazrul-api.onrender.com/nazrul/imgur",
  "https://noobs-api.onrender.com/nazrul/imgur"
];

module.exports = {
  config: {
    name: "imgur",
    version: "2.0",
    role: 0,
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    shortDescription: {
      en: "Upload images to Imgur",
      bn: "Imgur-এ ছবি আপলোড করুন"
    },
    longDescription: {
      en: "Upload images to Imgur and get direct links",
      bn: "Imgur-এ ছবি আপলোড করে সরাসরি লিঙ্ক পান"
    },
    category: "media",
    guide: {
      en: "{pn} [reply to image]",
      bn: "{pn} [ছবিতে রিপ্লাই করুন]"
    },
    countDown: 10
  },

  langs: {
    en: {
      noImage: "🖼️ Please reply to an image or attach an image",
      uploading: "⏳ Uploading your image to Imgur...",
      success: "✅ Image uploaded successfully!\n\n🔗 Direct Link: {link}\n\n📌 Copy Link: `{link}`",
      error: "❌ Failed to upload image. Please try again later",
      invalidResponse: "⚠️ Received invalid response from server",
      noEndpoint: "🚫 All upload endpoints failed. Try again later"
    },
    bn: {
      noImage: "🖼️ অনুগ্রহ করে একটি ছবিতে রিপ্লাই করুন বা ছবি সংযুক্ত করুন",
      uploading: "⏳ আপনার ছবি Imgur-এ আপলোড করা হচ্ছে...",
      success: "✅ ছবি সফলভাবে আপলোড হয়েছে!\n\n🔗 সরাসরি লিঙ্ক: {link}\n\n📌 লিঙ্ক কপি করুন: `{link}`",
      error: "❌ ছবি আপলোড করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন",
      invalidResponse: "⚠️ সার্ভার থেকে অবৈধ প্রতিক্রিয়া পাওয়া গেছে",
      noEndpoint: "🚫 সব আপলোড এন্ডপইন্ট ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন"
    }
  },

  onStart: async function ({ api, event, message, getLang }) {
    try {
      // Check for image attachment
      const imageUrl = this.getImageUrl(event);
      if (!imageUrl) {
        return message.reply(getLang('noImage'));
      }

      // Send uploading notification
      message.reply(getLang('uploading'));

      // Try all API endpoints
      for (const endpoint of API_ENDPOINTS) {
        try {
          const result = await this.uploadToImgur(endpoint, imageUrl);
          if (result.success) {
            return message.reply(getLang('success', { link: result.link }));
          }
        } catch (error) {
          console.error(`Endpoint ${endpoint} failed:`, error);
        }
      }

      // All endpoints failed
      message.reply(getLang('noEndpoint'));
    } catch (error) {
      console.error('Imgur command error:', error);
      message.reply(getLang('error'));
    }
  },

  getImageUrl: function (event) {
    if (event.type === "message_reply" && 
        event.messageReply.attachments?.length > 0 &&
        event.messageReply.attachments[0].type === "photo") {
      return event.messageReply.attachments[0].url;
    } 
    
    if (event.attachments?.length > 0 && 
        event.attachments[0].type === "photo") {
      return event.attachments[0].url;
    }
    
    return null;
  },

  uploadToImgur: async function (endpoint, imageUrl) {
    const response = await axios.get(`${endpoint}?link=${encodeURIComponent(imageUrl)}`, {
      timeout: 10000
    });

    if (!response.data || !response.data.uploaded || !response.data.uploaded.image) {
      throw new Error('Invalid response structure');
    }

    return {
      success: true,
      link: response.data.uploaded.image
    };
  }
};
