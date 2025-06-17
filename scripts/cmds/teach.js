const axios = require("axios"); // ✅ Direct require to avoid undefined error

module.exports = {
  config: {
    name: "teach",
    aliases: ["simteach"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Teach Sim chatbot"
    },
    longDescription: {
      en: "Teach a chatbot your custom questions and answers"
    },
    category: "teach",
    guide: {
      en: "{pn} your question | chatbot answer"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { messageID, threadID } = event;

    if (!args[0] || !args.join(" ").includes("|")) {
      return api.sendMessage("⚠️ Use: .teach your question | chatbot's answer", threadID, messageID);
    }

    const [question, answer] = args.join(" ").split("|").map(x => x.trim());

    if (!question || !answer) {
      return api.sendMessage("❌ Invalid format. Make sure both question and answer are provided.", threadID, messageID);
    }

    try {
      const apiUrl = `https://simapi-bot.onrender.com/api/teach?ask=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}&lang=en`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        return api.sendMessage(`✅ Sammy has been taught!\n📥 Ask: ${question}\n📤 Answer: ${answer}`, threadID, messageID);
      } else {
        return api.sendMessage("❌ Failed to teach Sammy. Try again later.", threadID, messageID);
      }
    } catch (err) {
      console.error("Teach Error:", err);
      return api.sendMessage("⚠️ An error occurred while teaching. Please try again.", threadID, messageID);
    }
  }
};
