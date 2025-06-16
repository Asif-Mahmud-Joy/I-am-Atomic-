const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "hack",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    category: "fun",
    shortDescription: {
      en: "Generates a 'hacking' image with the user's profile picture.",
    },
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

  onStart: async function ({ args, usersData, threadsData, api, event }) {
    const tmpDir = __dirname + "/tmp";
    const pathImg = `${tmpDir}/background.png`;
    const pathAvt = `${tmpDir}/avatar.png`;

    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const userInfo = await api.getUserInfo(uid);
      const name = userInfo[uid].name;

      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt, avatarBuffer);

      const bgURL = "https://i.imgur.com/VQXViKI.png";
      const backgroundBuffer = (
        await axios.get(bgURL, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, backgroundBuffer);

      const baseImage = await loadImage(pathImg);
      const avatarImage = await loadImage(pathAvt);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatarImage, 83, 437, 100, 101);

      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 200, 497);

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, finalBuffer);
      fs.removeSync(pathAvt);

      return api.sendMessage({
        body: "✅ সফলভাবে হ্যাক করা হইসে! আপনার ইনবক্স চেক করুন।",
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
    } catch (err) {
      console.error("[HackCmdError]", err);
      return api.sendMessage("❌ হ্যাকিং প্রক্রিয়ায় সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  },
};
