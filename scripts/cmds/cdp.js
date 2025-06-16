const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "couple dp"
    },
    longDescription: {
      en: "Get a random couple display picture (DP)"
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const tempDir = path.join(__dirname, "tmp");
    await fs.ensureDir(tempDir);

    try {
      const { data } = await axios.get("https://api.akyuu.xyz/api/coupledpp?apikey=akuu");

      if (!data.male || !data.female) {
        return api.sendMessage("❌ Couldn't fetch couple DP. Try again later.", event.threadID, event.messageID);
      }

      const malePath = path.join(tempDir, "male.png");
      const femalePath = path.join(tempDir, "female.png");

      const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
      fs.writeFileSync(malePath, Buffer.from(maleImg.data));

      const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
      fs.writeFileSync(femalePath, Buffer.from(femaleImg.data));

      const msg = "🫶 Bangla Love Couple DP ready ase ✨";

      return api.sendMessage({
        body: msg,
        attachment: [
          fs.createReadStream(malePath),
          fs.createReadStream(femalePath)
        ]
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error("[CDP ERROR]", err);
      return api.sendMessage("❌ API error hoye gese. Pore try koron.", event.threadID, event.messageID);
    }
  }
};
