const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp2",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get a random couple dp"
    },
    longDescription: {
      en: "Fetches a random male and female couple dp"
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const tmpPath1 = path.join(__dirname, "tmp", "img1.png");
    const tmpPath2 = path.join(__dirname, "tmp", "img2.png");

    try {
      const { data } = await axios.get("https://api.akyuu.xyz/api/coupledpp?apikey=akuu");

      const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
      fs.writeFileSync(tmpPath1, Buffer.from(maleImg.data, "utf-8"));

      const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
      fs.writeFileSync(tmpPath2, Buffer.from(femaleImg.data, "utf-8"));

      const msg = "💑 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏 𝐭𝐨𝐦𝐫𝐚𝐫 𝐣𝐨𝐧𝐧𝐨 𝐚𝐬𝐞 ✨";

      const allImages = [
        fs.createReadStream(tmpPath1),
        fs.createReadStream(tmpPath2)
      ];

      api.sendMessage({
        body: msg,
        attachment: allImages
      }, event.threadID, event.messageID);

      // Cleanup temp files after short delay
      setTimeout(() => {
        fs.unlinkSync(tmpPath1);
        fs.unlinkSync(tmpPath2);
      }, 30000);

    } catch (error) {
      console.error("❌ Error fetching couple dp:", error);
      api.sendMessage("❌ Sorry! Couple DP nite problem holo. Try again pore.", event.threadID, event.messageID);
    }
  }
};
