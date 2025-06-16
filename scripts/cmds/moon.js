const moment = require("moment-timezone");
const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const Canvas = require("canvas");
const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "moon",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View the moon image of any date",
      bn: "চাহিদামত তারিখে চাঁদের ছবি দেখুন"
    },
    longDescription: {
      en: "Shows the moon phase image on a specific date (DD/MM/YYYY format)",
      bn: "আপনার দেওয়া তারিখ অনুযায়ী চাঁদের অবস্থা দেখাবে (DD/MM/YYYY ফরম্যাটে)"
    },
    category: "image",
    guide: {
      en: "{pn} <day/month/year> [caption]",
      bn: "{pn} <দিন/মাস/বছর> [caption(optional)]"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const dateInput = args[0];
    const date = checkDate(dateInput);
    if (!date)
      return message.reply("📅 Valid format use korun: DD/MM/YYYY");

    const url = `https://lunaf.com/lunar-calendar/${date}`;
    let html;

    try {
      html = await axios.get(url, { httpsAgent: agent });
    } catch (err) {
      return message.reply(`❌ Error: Cannot fetch moon data for ${args[0]}`);
    }

    const $ = cheerio.load(html.data);
    const href = $("figure img").attr("data-ezsrcset");
    if (!href) return message.reply("🚫 Moon image not found.");

    const numberMatch = href.match(/phase-(\d+)\.png/);
    if (!numberMatch) return message.reply("🚫 Moon phase not detected.");

    const number = numberMatch[1];
    const imgSrc = moonImages[Number(number)];
    const { data: imgSrcBuffer } = await axios.get(imgSrc, { responseType: "arraybuffer" });

    const msg = `🌙 Moon Image on ${args[0]}\n` +
      `📖 Info: ${$($('h3').get()[0]).text()}\n` +
      `🔎 Phase: ${$("#phimg > small").text()}\n` +
      `🌐 Source: ${url}`;

    if (args.length > 1) {
      const caption = args.slice(1).join(" ");
      const canvas = Canvas.createCanvas(1080, 2400);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 1080, 2400);

      const moon = await Canvas.loadImage(imgSrcBuffer);
      centerImage(ctx, moon, 540, 1200, 970, 970);

      ctx.font = "60px 'Kanit SemiBold'";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";

      const lines = getLines(ctx, caption, 900);
      let y = 2095 - (lines.length * 75) / 2;
      for (const line of lines) {
        ctx.fillText(line, 540, y);
        y += 75;
      }

      const pathSave = __dirname + "/tmp/wallMoon.png";
      fs.ensureDirSync(__dirname + "/tmp");
      fs.writeFileSync(pathSave, canvas.toBuffer());

      return message.reply({
        body: msg,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } else {
      const stream = await getStreamFromURL(imgSrc);
      return message.reply({ body: msg, attachment: stream });
    }
  }
};

const pathFont = __dirname + "/assets/font/Kanit-SemiBoldItalic.ttf";
Canvas.registerFont(pathFont, { family: "Kanit SemiBold" });

function getLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function centerImage(ctx, img, x, y, sizeX, sizeY) {
  ctx.drawImage(img, x - sizeX / 2, y - sizeY / 2, sizeX, sizeY);
}

function checkDate(date) {
  const [day0, month0, year0] = (date || "").split('/');
  const day = (day0 || "").padStart(2, '0');
  const month = (month0 || "").padStart(2, '0');
  const year = year0 || "";
  const formatted = `${year}/${month}/${day}`;
  return moment(formatted, 'YYYY/MM/DD', true).isValid() ? formatted : false;
}

const moonImages = [
  'https://i.ibb.co/9shyYH1/moon-0.png',
  'https://i.ibb.co/vBXLL37/moon-1.png',
  'https://i.ibb.co/0QCKK9D/moon-2.png',
  'https://i.ibb.co/Dp62X2j/moon-3.png',
  'https://i.ibb.co/xFKCtfd/moon-4.png',
  'https://i.ibb.co/m4L533L/moon-5.png',
  'https://i.ibb.co/VmshdMN/moon-6.png',
  'https://i.ibb.co/4N7R2B2/moon-7.png',
  'https://i.ibb.co/C2k4YB8/moon-8.png',
  'https://i.ibb.co/F62wHxP/moon-9.png',
  'https://i.ibb.co/Gv6R1mk/moon-10.png',
  'https://i.ibb.co/0ZYY7Kk/moon-11.png',
  'https://i.ibb.co/KqXC5F5/moon-12.png',
  'https://i.ibb.co/BGtLpRJ/moon-13.png',
  'https://i.ibb.co/jDn7pPx/moon-14.png',
  'https://i.ibb.co/kykn60t/moon-15.png',
  'https://i.ibb.co/qD4LFLs/moon-16.png',
  'https://i.ibb.co/qJm9gcQ/moon-17.png',
  'https://i.ibb.co/yYFYZx9/moon-18.png',
  'https://i.ibb.co/8bc7vpZ/moon-19.png',
  'https://i.ibb.co/jHG7DKs/moon-20.png',
  'https://i.ibb.co/5WD18Rn/moon-21.png',
  'https://i.ibb.co/3Y06yHM/moon-22.png',
  'https://i.ibb.co/4T8Zdfy/moon-23.png',
  'https://i.ibb.co/n1CJyP4/moon-24.png',
  'https://i.ibb.co/zFwJRqz/moon-25.png',
  'https://i.ibb.co/gVBmMCW/moon-26.png',
  'https://i.ibb.co/hRY89Hn/moon-27.png',
  'https://i.ibb.co/7C13s7Z/moon-28.png',
  'https://i.ibb.co/2hDTwB4/moon-29.png',
  'https://i.ibb.co/Rgj9vpj/moon-30.png',
  'https://i.ibb.co/s5z0w9R/moon-31.png'
];
