const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "mia",
    aliases: ["mia khalifa"],
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    category: "write",
    shortDescription: {
      en: "Write your text on Mia Khalifa's board meme",
    },
    longDescription: {
      en: "Writes your custom text on an image of Mia Khalifa holding a board.",
    },
    guide: {
      en: "{pn} your_text_here"
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text) return api.sendMessage("📝 Text dao ja likhbo board-e!", event.threadID, event.messageID);

    const imgURL = "https://i.imgur.com/iXbcwYy.png"; // Valid static hosted image
    const imgPath = __dirname + "/cache/mia.png";

    try {
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      const baseImage = await loadImage(imgPath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0);
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";

      const lines = await this.wrapText(ctx, text, 500);
      ctx.fillText(lines.join("\n"), 50, 120);

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(imgPath, finalBuffer);

      api.sendMessage({
        body: "📸 Here's your Mia meme:",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

    } catch (err) {
      console.error("❌ Mia cmd error:", err);
      api.sendMessage("😓 Error hoise bhai, abr try koro!", event.threadID, event.messageID);
    }
  }
};
