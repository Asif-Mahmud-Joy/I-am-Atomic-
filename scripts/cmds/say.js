const fs = require("fs");
const axios = require("axios");
const googleTTS = require("google-tts-api");

module.exports = {
  config: {
    name: "say",
    aliases: ["speak", "kotha"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Convert text to Bangla voice",
      bn: "টেক্সট কে বাংলায় ভয়েসে রূপান্তর করুন"
    },
    longDescription: {
      en: "Bot will speak your text in Bangla using Google TTS",
      bn: "বট আপনার টেক্সট বাংলায় Google TTS ব্যবহার করে বলবে"
    },
    category: "media",
    guide: {
      en: "{pn} <your bangla text>",
      bn: "{pn} <আপনার বাংলা টেক্সট>"
    }
  },

  onStart: async function ({ args, message, event }) {
    const text = args.join(" ");
    if (!text) return message.reply("⚠️ দয়া করে একটি বার্তা লিখুন!");

    try {
      const url = googleTTS.getAudioUrl(text, {
        lang: 'bn',
        slow: false,
        host: 'https://translate.google.com'
      });

      const path = `${__dirname}/cache/say_${event.threadID}_${event.messageID}.mp3`;
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(path, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `🔊 বললাম: ${text}`,
        attachment: fs.createReadStream(path)
      });

      fs.unlink(path, () => {}); // async delete
    } catch (err) {
      console.error("❌ Say command error:", err);
      message.reply("❌ ভয়েস বানাতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
  }
};
