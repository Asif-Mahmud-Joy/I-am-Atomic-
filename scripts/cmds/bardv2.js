const axios = require("axios");
const fs = require("fs-extra");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bardv2",
    version: "2.0",
    usePrefix: true,
    hasPermission: 0,
    credits: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    description: "Bard AI with image-to-text and voice reply",
    commandCategory: "ai",
    usages: "{pn} <question or image reply>",
    cooldowns: 5,
    guide: {
      en: "Reply to an image or type your question directly",
      bn: "ছবির রিপ্লাই দিন অথবা সরাসরি প্রশ্ন লিখুন"
    }
  },

  langs: {
    en: {
      processing: "Searching for an answer, please wait...",
      noInput: "Please provide a question or reply to an image.",
      imgError: "❌ Couldn't extract text from the image. Try a clearer one.",
      voiceError: "❌ Error generating voice response.",
      apiError: "❌ Something went wrong while fetching data."
    },
    bn: {
      processing: "উত্তর খাঁজা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
      noInput: "প্রশ্ন লিখুন অথবা কোনো ছবির রিপ্লাই দিন।",
      imgError: "❌ ছবির থেকে লেখা পড়া যায়নি, পরিষ্কার ছবি দিন।",
      voiceError: "❌ ভয়েস রেসপন্স ত্রিরি করা যায়নি।",
      apiError: "❌ তথ্য আনতে গিয়ে সমস্যা হয়েছে।"
    }
  },

  onStart: async function ({ api, event, getLang }) {
    const { threadID, messageID, type, messageReply, body } = event;
    let question = "";
    const tempVoicePath = path.join(__dirname, "cache", `bard_voice_${Date.now()}.mp3`); // Unique file name

    // Determine input source
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      const imageURL = messageReply.attachments[0].url;
      question = await convertImageToText(imageURL);
      if (!question) return api.sendMessage(getLang("imgError"), threadID, messageID);
    } else {
      question = body.replace(/^.*?\s/, "").trim();
      if (!question) return api.sendMessage(getLang("noInput"), threadID, messageID);
    }

    // Notify user of processing
    api.sendMessage(getLang("processing"), threadID);

    try {
      // Fetch response from Bard AI
      const res = await axios.get(`https://bard-ai.arjhilbard.repl.co/bard?ask=${encodeURIComponent(question)}`);
      const respond = res.data.message;

      // Generate voice response
      const gttsInstance = new gtts(respond, "en"); // Future enhancement: Detect language or allow user choice
      gttsInstance.save(tempVoicePath, function (error) {
        if (error) {
          console.error("Voice generation error:", error);
          return api.sendMessage(getLang("voiceError"), threadID, messageID);
        }

        // Send text and voice response
        api.sendMessage(
          {
            body: `🤖 𝗕𝗮𝗿𝗱 𝗔𝗜 𝗥𝗲𝗽𝗹𝘆:\n\n${respond}`,
            attachment: fs.createReadStream(tempVoicePath)
          },
          threadID,
          () => fs.unlinkSync(tempVoicePath), // Clean up after sending
          messageID
        );
      });
    } catch (err) {
      console.error("API error:", err);
      api.sendMessage(getLang("apiError"), threadID, messageID);
    }
  }
};

async function convertImageToText(imageURL) {
  try {
    const response = await axios.get(`https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`);
    return response.data.extractedText;
  } catch (err) {
    console.error("Image-to-text error:", err);
    return null;
  }
}
