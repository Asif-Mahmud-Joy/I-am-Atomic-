// ✅ Working Bard + Image2Text + Pinterest + Voice
const axios = require("axios");
const fs = require("fs-extra");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bard",
    aliases: ["askbard"],
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Bard AI with image2text, Pinterest image search, and voice",
      bn: "Bard AI image to text, ছবি সার্চ ও ভয়েস সহ"
    },
    longDescription: {
      en: "Use Bard AI with optional Pinterest images and voice reply",
      bn: "Bard AI এর উত্তর, ছবি ও ভয়েসসহ পেতে পারেন"
    },
    category: "ai",
    guide: {
      en: "{pn} <your question> or reply to an image",
      bn: "{pn} <আপনার প্রশ্ন> অথবা একটি ছবির রিপ্লাই দিন"
    }
  },

  langs: {
    en: {
      noInput: "❌ Please provide a question or reply to an image.",
      processing: "🔍 Processing your request...",
      imageError: "❌ Couldn't extract text from the image.",
      bardError: "❌ Failed to get a response from Bard.",
      voiceFail: "⚠️ Voice generation failed.",
      done: "✅ Done"
    },
    bn: {
      noInput: "❌ প্রশ্ন দিন অথবা একটি ছবির রিপ্লাই করুন।",
      processing: "🔍 অনুরোধটি প্রসেস করা হচ্ছে...",
      imageError: "❌ ছবির লেখা পড়া যায়নি।",
      bardError: "❌ Bard থেকে উত্তর পাওয়া যায়নি।",
      voiceFail: "⚠️ ভয়েস তৈরি করা যায়নি।",
      done: "✅ সম্পন্ন হয়েছে"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { threadID, messageID, type, messageReply } = event;
    let question = "";

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    async function convertImageToText(imageURL) {
      try {
        const res = await axios.get(`https://api.zahidtween.repl.co/ocr?url=${encodeURIComponent(imageURL)}`);
        return res.data.text || null;
      } catch (e) {
        return null;
      }
    }

    function fontStyle(text) {
      return text.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x1d4f0 - 0x61));
    }

    if (type === "message_reply" && messageReply.attachments?.[0]?.type === "photo") {
      const imageURL = messageReply.attachments[0].url;
      question = await convertImageToText(imageURL);
      if (!question) return api.sendMessage(getLang("imageError"), threadID, messageID);
    } else {
      question = args.join(" ").trim();
      if (!question) return api.sendMessage(getLang("noInput"), threadID, messageID);
    }

    api.sendMessage(getLang("processing"), threadID);

    try {
      const bardRes = await axios.get(`https://api.zahidtween.repl.co/bard?q=${encodeURIComponent(question)}`);
      const answer = bardRes.data.message || "No response.";

      const imageRes = await axios.get(`https://api.zahidtween.repl.co/pin?q=${encodeURIComponent(question)}`);
      const images = imageRes.data?.images?.slice(0, 4) || [];

      const files = [];
      for (let i = 0; i < images.length; i++) {
        const img = await axios.get(images[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(cacheDir, `img_${i}.jpg`);
        fs.writeFileSync(imgPath, Buffer.from(img.data, 'binary'));
        files.push(fs.createReadStream(imgPath));
      }

      const voicePath = path.join(cacheDir, 'bard_voice.mp3');
      const gttsInstance = new gtts(answer, 'en');

      gttsInstance.save(voicePath, err => {
        if (err) return api.sendMessage(getLang("voiceFail"), threadID, messageID);
        api.sendMessage({
          body: `🤖 Bard:

${fontStyle(answer)}`,
          attachment: [fs.createReadStream(voicePath), ...files]
        }, threadID, () => {
          fs.unlinkSync(voicePath);
          files.forEach(f => fs.unlinkSync(f.path));
        }, messageID);
      });
    } catch (e) {
      console.error(e);
      return api.sendMessage(getLang("bardError"), threadID, messageID);
    }
  }
};
