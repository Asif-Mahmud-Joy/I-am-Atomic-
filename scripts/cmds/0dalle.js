const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// ☣️⚛️ ATOMIC CONFIGURATION ⚛️☣️
const config = {
  TEMP_DIR: path.join(os.tmpdir(), 'gojo_ai_temp'),
  MAX_IMAGE_SIZE_MB: 5,
  CLEANUP_INTERVAL: 30 * 60 * 1000,
  MAX_IMAGES: 4,
  API_TIMEOUT: 30000,
  PROMPT_PREFIX: "Ultra HD, Gojo Satoru style, anime masterpiece, ",
  BLACKLIST: ["nude", "naked", "sexual", "porn"]
};

// 🛠️ Initialize environment
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

// ▰▰▰▰▰▰▰▰▰▰ PROGRESS BAR ▰▰▰▰▰▰▰▰▰▰
function generateProgressBar(percentage) {
  const blocks = 20;
  const completed = Math.round(blocks * (percentage / 100));
  return `▰`.repeat(completed) + `▱`.repeat(blocks - completed);
}

module.exports = {
  config: {
    name: "gojo_ai",
    aliases: ["dalle", "gojoart", "সাতোরু"],
    version: "4.1",
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

  onStart: async function ({ message, args, event, api }) {
    try {
      // ✍️ Typing animation
      message.replyTyping();
      
      const prompt = args.join(" ").trim();
      
      // 🔍 Validation
      if (!prompt) {
        return message.reply(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
❌ *ইনপুট রিকুয়েস্ট*
📝 একটা prompt দাও যাতে Gojo-style ছবি তৈরি করা যায়!

💡 উদাহরণ:
   gojo_ai Jujutsu High at sunset
   gojo_ai Gojo vs Sukuna epic battle
━━━━━━━━━━━━━━━━━━━━━`);
      }
      
      if (prompt.length > 500) {
        return message.reply(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
⚠️ *প্রম্পট লিমিট*
📏 সর্বোচ্চ ৫০০ অক্ষর অনুমোদিত
🔢 আপনার প্রম্পট: ${prompt.length} অক্ষর
━━━━━━━━━━━━━━━━━━━━━`);
      }
      
      // 🔞 Content filter
      const blacklisted = config.BLACKLIST.some(word => 
        prompt.toLowerCase().includes(word)
      );
      
      if (blacklisted) {
        return message.reply(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
🚫 *কন্টেন্ট রেস্ট্রিকশন*
এই ধরনের কন্টেন্ট অনুমোদিত নয়!

🔒 সিস্টেম স্বয়ংক্রিয়ভাবে ব্ল্যাকলিস্টেড
কন্টেন্ট ফিল্টার করে
━━━━━━━━━━━━━━━━━━━━━`);
      }

      // ⏳ Processing message with random Gojo response
      const processingMsg = await message.reply(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
🌀 ${getGojoResponse('waiting')}

▰▰▰▱▱▱▱▱▱ ৩০% সম্পন্ন
━━━━━━━━━━━━━━━━━━━━━
📝 *প্রম্পট:* ${prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}
⚙️ মডেল: DALL·E 3
🌐 API: DeepSeek-R1-0528
━━━━━━━━━━━━━━━━━━━━━`);

      // 🌐 API call
      const apiURL = `https://openart.ai/api/v1/dalle?prompt=${encodeURIComponent(config.PROMPT_PREFIX + prompt)}`;
      const { data } = await axios.get(apiURL, { timeout: config.API_TIMEOUT });

      if (!data?.images?.length) {
        throw new Error("API error - no images generated");
      }

      // Update progress
      await api.sendMessage(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
🖼️ *ইমেজ জেনারেশন সফল!*
${generateProgressBar(60)} ৬০% সম্পন্ন

🔢 ${data.images.length} টি ইমেজ তৈরি হয়েছে
📥 ডাউনলোড শুরু হচ্ছে...
━━━━━━━━━━━━━━━━━━━━━`, event.threadID);

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
        body: `☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
✨ ${getGojoResponse('success')}
${generateProgressBar(100)} ১০০% সম্পন্ন

🔮 *প্রম্পট:* ${prompt}
🖼️ *তৈরি ইমেজ:* ${attachments.length} টি

🌸 *সিস্টেম স্ট্যাটাস:*
⏱️ API লেটেন্সি: ${data.latency ? data.latency + 'ms' : 'N/A'}
💾 মেমরি ব্যবহার: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
🔧 ভার্সন: 4.1 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍
━━━━━━━━━━━━━━━━━━━━━
💙 Jujutsu Kaisen Fan Art | Gojo Satoru Style`,
        attachment: attachments
      });

      // 🧹 Cleanup
      await api.unsendMessage(processingMsg.messageID).catch(() => {});
      await fs.emptyDir(config.TEMP_DIR).catch(() => {});

    } catch (error) {
      console.error("Gojo AI Error:", error);
      message.reply(`☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━
😵 ${getGojoResponse('error')}

🔧 *টেকনিক্যাল ডিটেইল:*
${error.message || "অজানা সমস্যা"}

💡 *সমাধানের উপায়:*
• ইন্টারনেট কানেকশন চেক করুন
• ছোট প্রম্পট দিয়ে আবার চেষ্টা করুন
• অ্যাডমিনকে রিপোর্ট করুন
━━━━━━━━━━━━━━━━━━━━━
⚙️ সিস্টেম স্ট্যাটাস: ${error.message.includes('API') ? 'API অফলাইন' : 'স্থিতিশীল'}`);

      await fs.emptyDir(config.TEMP_DIR).catch(() => {});
    }
  }
};
