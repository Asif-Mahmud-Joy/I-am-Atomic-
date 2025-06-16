const sendWaiting = true; // enable or disable sending "images in progress, please wait...";
const textWaiting = "Image initialization, please wait a moment";
const fonts = "/cache/Play-Bold.ttf";
const downfonts = "https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download";
const fontsLink = 20;
const fontsInfo = 28;
const colorName = "#00FFFF";

module.exports = {
 config: {
  name: "cardinfo",
  version: "1.1",
  author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
  countDown: 5,
  role: 0,
  shortDescription: {
   en: "Make a Facebook card info"
  },
  longDescription: {
   en: "Generate a card-style profile using user info and avatar"
  },
  category: "logo",
  guide: {
   en: "{pn} <Name> <Sex> <followers> <love> <DOB> <Location> <FB Link>"
  }
 },

 onStart: async function ({ api, event, args }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  const Canvas = require("canvas");

  if (sendWaiting) await api.sendMessage(textWaiting, event.threadID);

  const pathImg = __dirname + `/cache/cardinfo_base.png`;
  const pathAvata = __dirname + `/cache/avatar_circle.png`;

  const uid = event.type === "message_reply" ? event.messageReply.senderID : event.senderID;
  const res = await api.getUserInfo(uid);

  const userName = res[uid]?.name || args[0] || "Not Found";
  const gender = args[1] || "Not Found";
  const follow = args[2] || "Not Found";
  const love = args[3] || "Not Found";
  const birthday = args[4] || "Not Found";
  const location = args[5] || "Not Found";
  const link = args[6] || `https://facebook.com/${uid}`;

  const avatarBuffer = (await axios.get(`https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  const bgBuffer = (await axios.get("https://i.ibb.co/RybN9XR/image.jpg", { responseType: 'arraybuffer' })).data;

  fs.writeFileSync(pathAvata, Buffer.from(avatarBuffer, 'utf-8'));
  fs.writeFileSync(pathImg, Buffer.from(bgBuffer, 'utf-8'));

  const avatarCircle = await this.circle(pathAvata);

  if (!fs.existsSync(__dirname + fonts)) {
   const fontData = (await axios.get(downfonts, { responseType: "arraybuffer" })).data;
   fs.writeFileSync(__dirname + fonts, Buffer.from(fontData, "utf-8"));
  }

  Canvas.registerFont(__dirname + fonts, { family: "Play-Bold" });
  const baseImage = await loadImage(pathImg);
  const baseAvata = await loadImage(avatarCircle);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0);
  ctx.drawImage(baseAvata, 80, 73, 285, 285);

  ctx.font = `${fontsInfo}px Play-Bold`;
  ctx.fillStyle = "#000000";
  ctx.fillText(userName, 480, 166);
  ctx.fillText(gender, 550, 208);
  ctx.fillText(follow, 550, 244);
  ctx.fillText(love, 550, 281);
  ctx.fillText(birthday, 550, 320);
  ctx.fillText(location, 550, 357);
  ctx.fillText(uid, 550, 396);

  ctx.font = `${fontsLink}px Play-Bold`;
  ctx.fillStyle = "#0000FF";
  ctx.fillText(link, 154, 465);

  const finalImage = canvas.toBuffer();
  fs.writeFileSync(pathImg, finalImage);
  fs.removeSync(pathAvata);

  return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
 },

 circle: async function (imagePath) {
  const jimp = require("jimp");
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
 }
};
