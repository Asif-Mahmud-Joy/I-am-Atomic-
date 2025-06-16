const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "batslap",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate a batslap image",
      bn: "ব্যাটম্যান থাপ্পড় মিম তৈরি করুন"
    },
    longDescription: {
      en: "Create a Batslap meme image using two Facebook avatars",
      bn: "দুইজনের অ্যাভাটার ব্যবহার করে ব্যাটম্যান থাপ্পড় মিম তৈরি করুন"
    },
    category: "image",
    guide: {
      en: "{pn} @mention",
      bn: "{pn} @মেনশন"
    }
  },

  langs: {
    en: {
      noTag: "❌ You must tag the person you want to slap.",
      done: "🖼️ Here's your Batslap meme!"
    },
    bn: {
      noTag: "❌ আপনি যাকে থাপ্পড় দিতে চান তাকে ট্যাগ করুন।",
      done: "🖼️ আপনার ব্যাটস্ল্যাপ মিম প্রস্তুত!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    if (!uid2) return message.reply(getLang("noTag"));

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);
      const img = await new DIG.Batslap().getImage(avatarURL1, avatarURL2);

      const path = `${__dirname}/cache/batslap_${uid1}_${uid2}.png`;
      fs.writeFileSync(path, Buffer.from(img));

      const caption = args.join(' ').replace(/@.*/, "").trim() || getLang("done");

      message.reply({
        body: caption,
        attachment: fs.createReadStream(path)
      }, () => fs.unlinkSync(path));

    } catch (err) {
      console.error("Batslap error:", err);
      message.reply("❌ Image generation failed. Please try again later.");
    }
  }
};
