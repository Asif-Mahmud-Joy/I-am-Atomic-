const axios = require('axios');
const request = require('request');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "khaby",
    aliases: ["khaby"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "🧠 Make a Khaby Lame meme",
    longDescription: "Generate a Khaby Lame meme with your custom text.",
    category: "fun",
    guide: {
      en: "{pn} [top text] | [bottom text]"
    }
  },

  onStart: async function ({ message, api, event, args }) {
    const input = args.join(" ");

    if (!input.includes("|")) {
      return message.reply("⚠️ Format bhul ase! Use this: !khaby Coke | Pepsi");
    }

    let [topText, bottomText] = input.split("|").map(t => encodeURIComponent(t.trim()));

    if (!topText || !bottomText) {
      return message.reply("⚠️ Dono text dorkar: !khaby Coke | Pepsi");
    }

    const imgUrl = `https://api.memegen.link/images/khaby-lame/${topText}/${bottomText}.png`;
    const imgPath = path.join(__dirname, "cache", `khaby-${Date.now()}.png`);

    try {
      const response = await axios({
        url: imgUrl,
        responseType: 'stream'
      });

      await fs.ensureDir(path.join(__dirname, "cache"));
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          { body: "Here's your Khaby meme 🧠", attachment: fs.createReadStream(imgPath) },
          event.threadID,
          () => fs.unlinkSync(imgPath)
        );
      });

      writer.on("error", err => {
        console.error("Write Stream Error:", err);
        message.reply("😓 Meme toiri korte somossa hoise. Try again later.");
      });

    } catch (err) {
      console.error("API Error:", err);
      message.reply("😓 Meme API kaj kortese na. Please try again later.");
    }
  }
};
