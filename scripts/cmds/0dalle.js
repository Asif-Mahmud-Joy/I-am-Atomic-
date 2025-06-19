const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// 🔥 Professional Configuration
const config = {
  TEMP_DIR: path.join(os.tmpdir(), 'gojo_ai_temp'),
  MAX_IMAGE_SIZE_MB: 5,
  CLEANUP_INTERVAL: 30 * 60 * 1000,
  MAX_IMAGES: 4,
  API_TIMEOUT: 30000,
  PROMPT_PREFIX: "Ultra HD, Gojo Satoru style, anime masterpiece, ",
  BLACKLIST: ["nude", "naked", "sexual", "porn"] // 🔞 Content filter
};

// 🛠️ Auto-create temp directory
if (!fs.existsSync(config.TEMP_DIR)) {
  fs.mkdirSync(config.TEMP_DIR, { recursive: true });
  console.log(`📁 Created temp directory: ${config.TEMP_DIR}`);
}

// 🧹 Automatic cleanup
setInterval(() => {
  fs.emptyDir(config.TEMP_DIR)
    .then(() => console.log('🧹 Temporary files cleaned'))
    .catch(err => console.error('Cleanup error:', err));
}, config.CLEANUP_INTERVAL);

process.on('exit', () => fs.emptyDirSync(config.TEMP_DIR));

// ✨ Gojo-style responses
const gojoResponses = {
  waiting: [
    "🌀 Infinity ভাবছে তোমার request...",
    "👁️‍🗨️ Gojo's Six Eyes processing...",
    "💫 Domain Expansion করতে সময় লাগবে...",
    "⚡ Unlimited Void এ তৈরি হচ্ছে তোমার ছবি..."
  ],
  success: [
    "✨ তোমার vision তৈরি হয়ে গেছে!",
    "🎨 Gojo-style masterpiece ready!",
    "💥 Domain Expansion complete!",
    "👌 Infinity এর magic দেখো!"
  ],
  error: [
    "❌ Domain Expansion fail করছে! আবার চেষ্টা করো",
    "⚠️ Infinity কাজ করছে না এখন!",
    "😵 Unlimited Void এ সমস্যা হচ্ছে!",
    "💢 Gojo এখন busy! পরে আসো"
  ]
};

// 🎨 Random Gojo response picker
const getGojoResponse = (type) => {
  const responses = gojoResponses[type] || [];
  return responses[Math.floor(Math.random() * responses.length)];
};

module.exports = {
  config: {
    name: "gojo_ai",
    aliases: ["dalle", "gojoart", "সাতোরু"],
    version: "4.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 + Gojo's Unlimited Creativity",
    countDown: 15,
    role: 0,
    shortDescription: "Gojo-style AI ছবি তৈরি করুন",
    longDescription: "DALL·E 3 ব্যবহার করে Gojo Satoru-স্টাইলে AI আর্ট তৈরি করুন",
    category: "AI",
    guide: {
      en: "{pn} [your prompt]\nExample: {pn} Gojo using Hollow Purple technique"
    }
  },

  onStart: async function ({ message, args, event }) {
    try {
      // ✍️ Typing animation
      message.replyTyping();
      
      const prompt = args.join(" ").trim();
      
      // 🔍 Validation
      if (!prompt) {
        return message.reply("📝 একটা prompt দাও যাতে Gojo-style ছবি তৈরি করা যায়!");
      }
      
      if (prompt.length > 500) {
        return message.reply("⚠️ Prompt ৫০০ অক্ষরের বেশি হতে পারবে না!");
      }
      
      // 🔞 Content filter
      const blacklisted = config.BLACKLIST.some(word => 
        prompt.toLowerCase().includes(word)
      );
      
      if (blacklisted) {
        return message.reply("🚫 এই ধরনের content অনুমোদিত নয়!");
      }

      // ⏳ Processing message with random Gojo response
      const processingMsg = await message.reply(
        `🌀 ${getGojoResponse('waiting')}\n\n` +
        "▰▰▰▱▱▱▱▱▱ ৪৫% সম্পন্ন"
      );

      // 🌐 API call
      const apiURL = `https://openart.ai/api/v1/dalle?prompt=${encodeURIComponent(config.PROMPT_PREFIX + prompt)}`;
      const { data } = await axios.get(apiURL, { timeout: config.API_TIMEOUT });

      if (!data?.images?.length) {
        throw new Error("API error - no images generated");
      }

      // 🖼️ Process images
      const attachments = [];
      for (let i = 0; i < Math.min(data.images.length, config.MAX_IMAGES); i++) {
        try {
          const url = data.images[i];
          const imageResponse = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 45000
          });

          const sizeMB = Buffer.byteLength(imageResponse.data) / (1024 * 1024);
          if (sizeMB > config.MAX_IMAGE_SIZE_MB) continue;

          const ext = imageResponse.headers['content-type']?.split('/')[1] || 'jpg';
          const imgPath = path.join(config.TEMP_DIR, `gojo_${Date.now()}_${i}.${ext}`);
          
          await fs.writeFile(imgPath, imageResponse.data);
          attachments.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Error processing image ${i + 1}:`, err);
        }
      }

      if (!attachments.length) {
        throw new Error("No valid images processed");
      }

      // 🎉 Send result
      await message.reply({
        body: `✨ ${getGojoResponse('success')}\n\n` +
              `🔮 Prompt: "${prompt}"\n` +
              `🌸 ${attachments.length} টি ছবি তৈরি হয়েছে!\n\n` +
              "💙 Jujutsu Kaisen Fan Art | Gojo Satoru Style",
        attachment: attachments
      });

      // 🧹 Cleanup
      await processingMsg.delete().catch(() => {});
      await fs.emptyDir(config.TEMP_DIR).catch(() => {});

    } catch (error) {
      console.error("Gojo AI Error:", error);
      message.reply(
        `😵 ${getGojoResponse('error')}\n\n` +
        "কারণ: " + (error.message || "অজানা সমস্যা") + "\n\n" +
        "⌛ আবার চেষ্টা করো কিছুক্ষণ পর!"
      );
      await fs.emptyDir(config.TEMP_DIR).catch(() => {});
    }
  }
};
