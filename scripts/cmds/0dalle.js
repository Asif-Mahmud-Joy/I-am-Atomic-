const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "dalle3",
    aliases: ["dalle"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 15,
    role: 0,
    shortDescription: "Dalle3 diye chobi toiri koro",
    longDescription: "Dalle3 er madhhome prompter upor base kore chobi generate koro (OpenAI API use kore nai)",
    category: "image",
    guide: {
      en: "{pn} describe your image"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const prompt = args.join(" ");
      if (!prompt) return message.reply("📝 Prompt dao jeta diye chobi toiri hobe!");

      const waitMsg = await message.reply("⏳ Chobi toiri hocche, ektu opekkha korun...");

      // Working and stable API (public)
      const apiURL = `https://openart.ai/api/v1/dalle?prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiURL);

      if (!data?.images?.length) throw new Error("🚫 Kono chobi pawa jai nai. Try another prompt.");

      const imagePaths = [];
      const tempFolder = path.join(__dirname, 'tmp');
      await fs.ensureDir(tempFolder);

      for (let i = 0; i < data.images.length; i++) {
        const imageURL = data.images[i];
        const imageResponse = await axios.get(imageURL, { responseType: 'arraybuffer' });
        const imgPath = path.join(tempFolder, `image_${i + 1}.jpg`);
        await fs.writeFile(imgPath, imageResponse.data);
        imagePaths.push(fs.createReadStream(imgPath));
      }

      await message.reply({ attachment: imagePaths });
      await fs.remove(tempFolder);

    } catch (error) {
      console.error("❌ Dalle3 error:", error);
      message.reply("❌ Somossa hoise chobi toiri korte. Prompt check koro ba porer ektu try koro.");
    }
  }
};
