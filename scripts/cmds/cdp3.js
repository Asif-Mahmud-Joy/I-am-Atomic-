const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp3",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "get random couple dp"
    },
    longDescription: {
      en: "Generates and sends a random male and female couple DP"
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const tempPath1 = path.join(__dirname, "tmp", `male_${Date.now()}.png`);
    const tempPath2 = path.join(__dirname, "tmp", `female_${Date.now()}.png`);

    try {
      const { data } = await axios.get("https://api.akyuu.xyz/api/coupledpp?apikey=akuu", {
        timeout: 10000
      });

      const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
      await fs.outputFile(tempPath1, maleImg.data);

      const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
      await fs.outputFile(tempPath2, femaleImg.data);

      await api.sendMessage({
        body: "💑 Here is your random couple DP!",
        attachment: [
          fs.createReadStream(tempPath1),
          fs.createReadStream(tempPath2)
        ]
      }, event.threadID, event.messageID);

      // Cleanup
      setTimeout(() => {
        fs.remove(tempPath1);
        fs.remove(tempPath2);
      }, 30 * 1000);

    } catch (error) {
      console.error("[CDP3 ERROR]", error.message || error);
      return api.sendMessage("❌ Sorry, couldn’t fetch couple DP right now. Try again later.", event.threadID);
    }
  }
};
