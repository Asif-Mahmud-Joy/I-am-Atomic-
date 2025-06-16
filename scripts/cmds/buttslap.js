const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "buttslap",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone meme style",
    longDescription: "Generate buttslap meme using Facebook avatars",
    category: "meme",
    guide: {
      en: "{pn} @mention"
    }
  },

  langs: {
    en: {
      noTag: "❌ Please tag someone to slap!",
      processing: "🛠️ Processing image...",
      failed: "❌ Failed to create image. Please try again later."
    },
    bn: {
      noTag: "❌ দয়া করে কাউকে tag করো slap দেয়ার জন্য!",
      processing: "🛠️ ইমেজ প্রসেস করা হচ্ছে...",
      failed: "❌ ইমেজ বানানো যায়নি। পরে আবার চেষ্টা করো।"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang, language }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    if (!uid2)
      return message.reply(getLang("noTag"));

    message.reply(getLang("processing"));

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      const apiUrl = `https://api.memegen.link/v1/buttslap?avatar1=${encodeURIComponent(avatarURL1)}&avatar2=${encodeURIComponent(avatarURL2)}`;

      const imgResponse = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(imgResponse.data);

      const tmpPath = path.join(__dirname, "tmp", `${uid1}_${uid2}_buttslap.png`);
      await fs.ensureDir(path.dirname(tmpPath));
      await fs.writeFile(tmpPath, imgBuffer);

      const text = args.join(" ").replace(Object.keys(event.mentions)[0], "").trim();

      await message.reply({
        body: text || "👋 hehe boii",
        attachment: fs.createReadStream(tmpPath)
      });

      fs.unlink(tmpPath, () => {});
    } catch (err) {
      console.error("[Buttslap Error]", err);
      message.reply(getLang("failed"));
    }
  }
};
