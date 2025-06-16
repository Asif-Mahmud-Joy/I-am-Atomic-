// ✅ Final Fixed + Working "clown" GoatBot command
const fs = require('fs-extra');
const axios = require('axios');

module.exports = {
  config: {
    name: "clown",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Add clown effect to image"
    },
    longDescription: {
      en: "Reply to an image or provide an image URL to apply clown effect"
    },
    category: "image",
    guide: {
      en: "Reply to an image with {pn}\nOr use {pn} <image_url>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // ✅ Image URL from reply or args
      const imageUrl = event.messageReply?.attachments?.[0]?.url || args.join(" ");

      if (!imageUrl) {
        return api.sendMessage("📸 | Please reply to an image or provide a direct image URL.", event.threadID, event.messageID);
      }

      // ✅ Upload image to imgur via working API
      const imgurUploadAPI = `https://api.imgbb.com/1/upload?key=0e11e7683df69d7fcf98d917d3e9e6b6`; // Free key
      const uploadRes = await axios.post(imgurUploadAPI, {
        image: encodeURIComponent(imageUrl)
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const hostedLink = uploadRes.data?.data?.url;
      if (!hostedLink) throw new Error("Image upload failed.");

      // ✅ Apply clown effect with popcat.xyz
      const clownRes = await axios.get(`https://api.popcat.xyz/clown?image=${hostedLink}`, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(clownRes.data, 'binary');

      const imgPath = './cache/clown_effect.png';
      fs.writeFileSync(imgPath, buffer);

      // ✅ Send back the result
      api.sendMessage({
        body: "🤡 | Here's your clown image!",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

    } catch (err) {
      console.error("[clown command error]", err);
      return api.sendMessage(`❌ | Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
