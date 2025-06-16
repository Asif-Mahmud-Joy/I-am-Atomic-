const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "2.0",
    role: 0,
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    longDescription: "Upscale images to 4K resolution using working API.",
    category: "image",
    guide: {
      en: "{pn} reply to an image to upscale it to 4K resolution."
    }
  },

  onStart: async function ({ message, event }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]?.type?.startsWith("image")) {
      return message.reply("⛔ Please reply to an image to upscale it to 4K.");
    }

    const imageURL = event.messageReply.attachments[0].url;
    const apiURL = `https://api.popcat.xyz/upscale?image=${encodeURIComponent(imageURL)}`;

    message.reply("🔄 Upscaling image to 4K... Please wait.", async (err, info) => {
      try {
        const response = await axios.get(apiURL, { responseType: "arraybuffer" });
        const tempPath = __dirname + "/upscaled.png";
        fs.writeFileSync(tempPath, Buffer.from(response.data));

        await message.reply({
          body: "✅ Here's your 4K upscaled image:",
          attachment: fs.createReadStream(tempPath)
        });

        fs.unlinkSync(tempPath);
        if (info?.messageID) message.unsend(info.messageID);
      } catch (err) {
        console.error("Upscale error:", err);
        return message.reply("❌ Failed to upscale image. Try another one or later.");
      }
    });
  }
};
