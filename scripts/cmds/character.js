const axios = require('axios');

module.exports = {
  config: {
    name: "character",
    aliases: ["character", "ctanime", "ac"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Anime character info paw",
    longDescription: "Search kore anime character er full info dekhao",
    category: "anime",
    guide: "{pn} {{character name}}"
  },

  onStart: async function ({ message, args }) {
    const name = args.join(" ");
    if (!name) return message.reply("⚠️ | Bhai character er naam dao!");

    const BASE_URL = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1&fields=about,name,nicknames,images,mal_id`;

    try {
      const response = await axios.get(BASE_URL);
      const data = response.data.data[0];

      if (!data) return message.reply(`❌ Character '${name}' pai nai bro.`);

      const characterName = data.name || "N/A";
      const nicknames = data.nicknames?.join(", ") || "None";
      const description = data.about ? data.about.replace(/\n/g, " ") : "No bio available.";
      const image = data.images?.jpg?.image_url;

      const msg = {
        body:
          `🎌 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿 𝗜𝗻𝗳𝗼
——————————————`
          + `\n🧑‍🎤 Name: ${characterName}`
          + `\n🎭 Nicknames: ${nicknames}`
          + `\n📖 Description: ${description.substring(0, 900)}...`,
      };

      if (image) msg.attachment = await global.utils.getStreamFromURL(image);

      message.reply(msg);
    } catch (err) {
      console.error("[Character Command Error]", err);
      message.reply("❌ Character data pete error hoise. Try onno naam.");
    }
  }
};
