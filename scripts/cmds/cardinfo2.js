const sendWaiting = true; // Enable/Disable "processing" message
const textWaiting = "Image initialization, please wait a moment...";
const fonts = "/cache/Play-Bold.ttf";
const downfonts = "https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download";
const fontsLink = 20;
const fontsInfo = 28;

module.exports = {
  config: {
    name: "cardinfo2",
    version: "1.1-upgraded",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Make a stylish group card info"
    },
    longDescription: {
      en: "Creates a Facebook group card using user info"
    },
    category: "logo",
    guide: {
      en: "{pn} <Name> <Sex> <followers> <Love> <DOB> <Location> <FB Link>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { loadImage, createCanvas } = require("canvas");
    const request = require("request");
    const fs = require("fs-extra");
    const axios = require("axios");
    const Canvas = require("canvas");
    let pathImg = __dirname + `/cache/card_output.png`;
    let pathAvatar = __dirname + `/cache/avatar.png`;

    if (sendWaiting) api.sendMessage(textWaiting, event.threadID);

    let uid = event.type === "message_reply" ? event.messageReply.senderID : event.senderID;

    const res = await api.getUserInfo(uid);

    let avatarBuffer = (await axios.get(`https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    let bgBuffer = (await axios.get("https://i.imgur.com/tW6nSDm.png", { responseType: "arraybuffer" })).data;

    fs.writeFileSync(pathAvatar, Buffer.from(avatarBuffer, 'utf-8'));
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer, 'utf-8'));

    if (!fs.existsSync(__dirname + fonts)) {
      let fontData = (await axios.get(downfonts, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(__dirname + fonts, Buffer.from(fontData, 'utf-8'));
    }

    let baseImage = await loadImage(pathImg);
    let avatar = await loadImage(await this.circle(pathAvatar));
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar, 80, 73, 285, 285);

    Canvas.registerFont(__dirname + fonts, { family: "Play-Bold" });
    ctx.font = `${fontsInfo}px Play-Bold`;
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    const get = (v, i, d) => (v && v !== "no data") ? v : (args[i] || d);

    const info = {
      name: get(res[uid]?.name, 0, "Not Found"),
      gender: get(res[uid]?.gender, 1, "Not Found"),
      follow: get(res[uid]?.follow, 2, "Not Found"),
      love: get(res[uid]?.relationship_status, 3, "Not Found"),
      birthday: get(res[uid]?.birthday, 4, "Not Found"),
      location: get(res[uid]?.location, 5, "Not Found"),
      link: get(res[uid]?.link, 6, "Not Found"),
      uid
    };

    ctx.fillText(info.name, 480, 172);
    ctx.fillText(info.gender, 550, 208);
    ctx.fillText(info.follow, 550, 244);
    ctx.fillText(info.love, 550, 281);
    ctx.fillText(info.birthday, 550, 320);
    ctx.fillText(info.location, 550, 357);
    ctx.fillText(info.uid, 550, 399);

    ctx.font = `${fontsLink}px Play-Bold`;
    ctx.fillStyle = "#0000FF";
    ctx.fillText(info.link, 175, 470);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvatar);

    return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  },

  circle: async function (imagePath) {
    const jimp = require("jimp");
    const image = await jimp.read(imagePath);
    image.circle();
    return await image.getBufferAsync("image/png");
  }
};
