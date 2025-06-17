const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "fbcover",
    version: "2.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Create stylish Facebook banner",
    longDescription: "Make a stylish FB cover with name, phone, email etc.",
    category: "image",
    guide: {
      en: "{pn} name | subname | address | phone | email | color"
    }
  },

  onStart: async function ({ message, args, event }) {
    const input = args.join(" ");
    // Banglish: Format check
    if (!input.includes("|")) {
      return message.reply(
        `⚠️ Format vul:
Usage: {pn} name | subname | address | phone | email | color`
      );
    }

    const parts = input.split("|").map(s => s.trim());
    const [name, subname, address, phone, email, color = ""] = parts;

    // Banglish: Sob field must fill
    if (!name || !subname || !address || !phone || !email) {
      return message.reply("🔴 Sob info dite hobe. Kono field khali rakhben na.");
    }

    // Banglish: API URL
    const apiURL = `https://api-samir.onrender.com/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&address=${encodeURIComponent(address)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&color=${encodeURIComponent(color)}`;

    try {
      await message.reply("🖌️ Banacchi cover, 1 sec...⏳");

      const imgStream = await global.utils.getStreamFromURL(apiURL);

      return message.reply({
        body: `✅ Tumar cover ready senpai 😻`,
        attachment: imgStream
      });
    } catch (err) {
      console.error("[fbcover] error:", err);
      return message.reply("❌ Cover generate korte somossa hoise. Try again later.");
    }
  }
};
