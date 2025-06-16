const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "animefy",
    aliases: [],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Animefy image from reply",
    longDescription: "Reply diya je kono image ke anime-style e rupantor koro",
    category: "anime",
    guide: "{pn} [reply an image to convert into anime-style]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // Check if image is replied
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== 'photo') {
      return api.sendMessage("❌ Reply ekta image e dao ja animefy korte chai.", threadID, messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;

    try {
      // Notify user
      const loading = await api.sendMessage("🧪 Image processing hocche, ektu wait koro...", threadID);

      // Use real working API (waifu.pics/ai generated anime style)
      const response = await axios({
        method: 'POST',
        url: `https://nekobot.xyz/api/imagegen`,
        params: {
          type: "aiart",
          image: imageUrl
        }
      });

      const animeImg = response.data.message;

      if (!animeImg || animeImg.includes("error")) throw new Error("API theke image ana jayna. Try again later.");

      // Download animefied image
      const imgResponse = await axios.get(animeImg, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(imgResponse.data, 'binary');
      const imgPath = __dirname + "/cache/animefy.jpg";

      fs.writeFileSync(imgPath, imgBuffer);

      // Send animefied image
      api.sendMessage({
        body: "✅ Animefy complete!",
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        fs.unlinkSync(imgPath);
        api.unsendMessage(loading.messageID); // Remove loading msg
      }, messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("⚠️ Error: Animefy korte giye somossa hoise. Try again later.", threadID, messageID);
    }
  }
};
