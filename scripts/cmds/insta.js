const axios = require("axios");

module.exports = {
  config: {
    name: "insta",
    aliases: ["instagram"],
    version: "2.0.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 2,
    role: 0,
    shortDescription: "Download Instagram video",
    longDescription: "Download any public Instagram video by URL",
    category: "media",
    guide: "{pn} <Instagram video link>"
  },

  onStart: async function ({ message, args }) {
    const url = args.join(" ");
    if (!url) return message.reply("📎 দয়া করে Instagram video link দিন।");

    const API_KEY = "trial";
    const API_URL = `https://api.instavideosave.com/allinone?url=${encodeURIComponent(url)}&apikey=${API_KEY}`;

    try {
      await message.reply("📥 ডাউনলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

      const res = await axios.get(API_URL);
      const data = res.data;

      if (!data || !data.status || data.status !== true || !data.medias || data.medias.length === 0)
        return message.reply("❌ ভিডিও খুঁজে পাওয়া যায়নি বা লিংক সঠিক নয়।");

      const videoUrl = data.medias.find(media => media.extension === 'mp4')?.url;
      const caption = data.title || "🎬 ইনস্টাগ্রাম ভিডিও";

      if (!videoUrl) return message.reply("❌ ভিডিও URL পাওয়া যায়নি।");

      const form = {
        body: caption,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      };

      return message.reply(form);
    } catch (err) {
      console.error("[INSTAGRAM DL ERROR]", err.message);
      return message.reply("🚫 ডাউনলোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।");
    }
  }
};
