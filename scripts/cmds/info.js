const moment = require('moment-timezone');
const axios = require('axios');

module.exports = {
  config: {
    name: "info",
    aliases: ["inf", "in4"],
    version: "2.1.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Bot এবং Admin এর তথ্য সহ ভিডিও পাঠায়"
    },
    longDescription: {
      en: "Bot এবং Admin এর বিস্তারিত তথ্য ও ভিডিও সহ প্রদান করে।"
    },
    category: "Information",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    this.sendInfo(message);
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "info") {
      this.sendInfo(message);
    }
  },

  sendInfo: async function (message) {
    const botName = "🌫 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🎩";
    const authorName = "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠";
    const authorFB = "https://www.facebook.com/share/1HPjorq8ce/";
    const authorInsta = "https://www.instagram.com/asifmahamud2023?igsh=dG82ODM0bzdnb3lm";
    const status = "𝗦𝗶𝗻𝗴𝗹𝗲";

    const now = moment().tz('Asia/Dhaka');
    const time = now.format('h:mm:ss A');

    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

    const videoUrl = "https://files.catbox.moe/qptlr8.mp4";

    const body = `
┏━━━━━━━━━━━━━━━━┓
┃ 🧑 Admin Info
┃ ╰➤ নাম: ${authorName}
┃ ╰➤ Facebook: ${authorFB}
┃ ╰➤ Instagram: ${authorInsta}
┃ ╰➤ স্টেটাস: ${status}
┃
┃ 🤖 Bot Info
┃ ╰➤ নাম: ${botName}
┃ ╰➤ সময়: ${time}
┃ ╰➤ চালু সময়: ${uptimeString}
┗━━━━━━━━━━━━━━━━┛

❝ আমি পারফেক্ট না হতে পারি,
   কিন্তু তোমার সাথে কথা বলব সবসময় ❞`;

    try {
      const response = await axios.get(videoUrl, { responseType: 'stream' });

      message.reply({
        body,
        attachment: response.data
      });
    } catch (err) {
      console.error("[INFO COMMAND ERROR]", err.message);
      message.reply("🚫 ভিডিও লোড করতে সমস্যা হয়েছে। পরে চেষ্টা করুন।");
    }
  }
};
