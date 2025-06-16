const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "fbcover",
    version: "2.0",
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
    if (!input.includes("|")) {
      return message.reply(
        "⚠️ Format vul:
/fbcover name | subname | address | phone | email | color"
      );
    }

    const [name, subname, address, phone, email, color = ""] = input.split("|").map(s => s.trim());

    if (!name || !subname || !address || !phone || !email) {
      return message.reply("🔴 Sob info dite hobe. Kono field khali rakhben na.");
    }

    const apiURL = `https://api-samir.onrender.com/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&address=${encodeURIComponent(address)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&color=${encodeURIComponent(color)}`;

    try {
      await message.reply("🖌️ Banacchi cover, 1 sec...⏳");

      const imgStream = await global.utils.getStreamFromURL(apiURL);

      message.reply({
        body: `✅ Tumar cover ready senpai 😻`,
        attachment: imgStream
      });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Cover generate korte somossa hoise. Try again later.");
    }
  }
};
