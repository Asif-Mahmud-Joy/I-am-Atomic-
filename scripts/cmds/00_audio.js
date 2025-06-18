const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const audioList = {
  women: {
    message: "☕「 Women 」",
    file: "women.mp3",
    url: "https://files.catbox.moe/3ifzpn.mp3",
  },
  yamate: {
    message: "🥵「 Yamate 」",
    file: "yamate.mp3",
    url: "https://files.catbox.moe/07hmj9.mp3",
  },
  dazai: {
    message: "😌「 ahhh~ 」",
    file: "Dazai.mp3",
    url: "https://files.catbox.moe/q83azf.mp3",
  },
  ara: {
    message: "😉「 ara ara 」",
    file: "ara.mp3",
    url: "https://files.catbox.moe/kl3pbc.mp3",
  },
  "good night": {
    message: "🌉「 Good Night 」",
    file: "night.mp3",
    url: "https://files.catbox.moe/15vs8u.mp3",
  },
  sus: {
    message: "🦎「 sus 」",
    file: "sus.mp3",
    url: "https://files.catbox.moe/0xpi2z.mp3",
  },
  "good morning": {
    message: "🌄「 Good Morning 」",
    file: "gm.mp3",
    url: "https://files.catbox.moe/d79j8g.mp3",
  },
  yourmom: {
    message: "😏「 Bujis ki nai? 」",
    file: "yourmom.mp3",
    url: "https://files.catbox.moe/hpc70p.mp3",
  },
  machikney: {
    message: "🔥「 Machikney 」",
    file: "machikney.mp3",
    url: "https://files.catbox.moe/c1grxy.mp3",
  },
  randi: {
    message: "😡「 Randi ko Chora 」",
    file: "randi.mp3",
    url: "https://files.catbox.moe/czk9ij.mp3",
  },
  sachiin: {
    message: "🌈「 GAYY 」",
    file: "sachiin.mp3",
    url: "https://files.catbox.moe/4n7jzq.mp3",
  },
  omg: {
    message: "😳「 OMG WoW 」",
    file: "omg.mp3",
    url: "https://files.catbox.moe/0q5jru.mp3",
  },
};

const cacheDir = path.join(__dirname, "cache");

async function ensureCacheDir() {
  try {
    await fs.ensureDir(cacheDir);
  } catch (err) {
    console.error("❌ ক্যাশ ডিরেক্টরি তৈরি করতে সমস্যা:", err);
  }
}

module.exports = {
  config: {
    name: "audio_new",
    version: "2.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 0,
    shortDescription: "🔊 স্পেসিফিক শব্দে অডিও প্লে করো",
    longDescription:
      "যখন কেউ নির্দিষ্ট শব্দ টাইপ করবে, তখন সেই অডিও প্লে করবে।",
    category: "no prefix",
  },

  onStart: async () => {
    await ensureCacheDir();
  },

  onChat: async function ({ event, message }) {
    try {
      if (!event.body) return;

      // টাইপিং অ্যানিমেশন
      if (message.replyTyping) await message.replyTyping();

      const keyword = event.body.toLowerCase().trim();
      if (!audioList.hasOwnProperty(keyword)) return;

      const { message: text, file, url } = audioList[keyword];
      const filePath = path.join(cacheDir, file);

      // ফাইল না থাকলে ডাউনলোড করো
      if (!(await fs.pathExists(filePath))) {
        try {
          const response = await axios.get(url, { responseType: "arraybuffer" });
          await fs.writeFile(filePath, Buffer.from(response.data));
          console.log(`✅ "${file}" ডাউনলোড সম্পন্ন হয়েছে।`);
        } catch (err) {
          console.error(`❌ ফাইল ডাউনলোডে সমস্যা (${file}):`, err);
          return message.reply(`❌ Sorry, "${keyword}" অডিও ডাউনলোড করতে পারছি না। পরে চেষ্টা করো।`);
        }
      }

      // অডিও প্লে করো
      return message.reply({
        body: text,
        attachment: fs.createReadStream(filePath),
      });
    } catch (error) {
      console.error("❌ অডিও কমান্ডে সমস্যা:", error);
      return message.reply("❌ কোন কিছু সমস্যা হয়েছে, দয়া করে পরে আবার চেষ্টা করুন।");
    }
  },
};
