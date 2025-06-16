const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "avatar",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Anime avatar generator with signature."
    },
    longDescription: {
      en: "Generate anime-style avatars with text and signature using GoatBot API."
    },
    category: "image",
    guide: {
      en: "{pn} ID or Name | Background Text | Signature | [Color (optional)]\nExample: {pn} Nezuko | Mr. Smokey | Asif | red"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    if (!args[0]) return message.reply("⚠️ Format:
avatar ID or Name | Background | Signature | Color (optional)");

    const input = args.join(" ").split("|").map(i => i.trim());
    const [charInput, bgText, signText, colorBg] = input;

    if (!bgText || !signText)
      return message.reply("⚠️ Background text & signature must be provided.");

    message.reply("🕒 Creating your avatar senpai, please wait...");

    let charID, charName;
    try {
      const characters = (await axios.get("https://goatbotserver.onrender.com/taoanhdep/listavataranime?apikey=ntkhang")).data.data;

      if (!isNaN(charInput)) {
        charID = parseInt(charInput);
        if (charID >= characters.length)
          return message.reply(`❌ Invalid ID! Max ID is ${characters.length - 1}`);
        charName = characters[charID].name;
      } else {
        const found = characters.find(c => c.name.toLowerCase() === charInput.toLowerCase());
        if (!found)
          return message.reply(`❌ Character \"${charInput}\" not found.`);
        charID = found.stt;
        charName = found.name;
      }
    } catch (e) {
      return message.reply(`❌ Character list fetch failed: ${e.message}`);
    }

    const apiURL = "https://goatbotserver.onrender.com/taoanhdep/avataranime";
    const params = {
      id: charID,
      chu_Nen: bgText,
      chu_Ky: signText,
      apikey: "ntkhangGoatBot"
    };
    if (colorBg) params.colorBg = colorBg;

    try {
      const imgStream = await getStreamFromURL(apiURL, "avatar.png", { params });
      message.reply({
        body: `✅ Avatar Created:
- Character: ${charName}
- ID: ${charID}
- BG: ${bgText}
- Signature: ${signText}
- Color: ${colorBg || "default"}`,
        attachment: imgStream
      });
    } catch (err) {
      try {
        const data = await err.response.data;
        message.reply(`❌ API Error: ${data.error}: ${data.message}`);
      } catch (_) {
        message.reply("❌ Unexpected error occurred while generating avatar.");
      }
    }
  }
};
