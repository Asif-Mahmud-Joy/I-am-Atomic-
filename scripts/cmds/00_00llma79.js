const axios = require('axios');

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function typingEffect(api, threadID, baseText, duration = 2500, interval = 500) {
  const dots = ['', '.', '..', '...'];
  let sent = await api.sendMessage(baseText, threadID);
  let elapsed = 0, i = 0;
  while (elapsed < duration) {
    await sleep(interval);
    i = (i + 1) % dots.length;
    try {
      await api.unsendMessage(sent.messageID);
      sent = await api.sendMessage(baseText + dots[i], threadID);
    } catch {}
    elapsed += interval;
  }
  try { await api.unsendMessage(sent.messageID); } catch {}
}

module.exports = {
  config: {
    name: "llma79",
    version: "4.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "member",
    shortDescription: {
      en: "AI generated romantic replies with typing animation ✨💌"
    },
    longDescription: {
      en: "AI chat powered by LLaMA model with romantic tone, typing animation & beautiful design."
    },
    guide: {
      en: "{pn} তোমার প্রশ্ন বা কথা\nউদাহরণ: {pn} তুমি আমার কাছে কেমন লাগো?"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID, messageReply, senderID } = event;
    try {
      // Prompt বানানো
      let prompt = args.join(" ").trim();
      if (messageReply && messageReply.body) {
        prompt = `${messageReply.body} ${prompt}`.trim();
      }

      if (!prompt) {
        return api.sendMessage(
          "💌 আমার কাছে কিছু বলো, আমি তোমার প্রতি প্রেমময় উত্তর দেবো।\n\nব্যবহার: llma79 তোমার মনের কথা\n\nউদাহরণ: llma79 তুমি আমার কাছে কেমন লাগো?",
          threadID,
          messageID
        );
      }

      // Typing animation শুরু
      await typingEffect(api, threadID, "💖 আমার হৃদয় তোমার জন্য অপেক্ষা করছে ...", 3000, 600);

      // API call - OpenRouter AI LLaMA model
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            { role: "system", content: "Respond in romantic, sweet tone with emojis." },
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json"
          }
        }
      );

      if (
        response.data &&
        response.data.choices &&
        response.data.choices[0] &&
        response.data.choices[0].message &&
        response.data.choices[0].message.content
      ) {
        const aiReply = response.data.choices[0].message.content;

        // Romantic styled reply with emojis
        const finalReply = `💌 তোমার মনের কথা শুনে আমার হৃদয় ঝলমল করছে... 🌹\n\n${aiReply}\n\n💖 সবসময় তোমার পাশে আছি...`;

        return api.sendMessage(finalReply, threadID, messageID);
      } else {
        return api.sendMessage(
          "😔 দুঃখিত, আমার মনে হচ্ছে বট এখন প্রেমময় জবাব দিতে পারছে না। একটু পরে আবার চেষ্টা করো।",
          threadID,
          messageID
        );
      }
    } catch (error) {
      console.error("🔥 llma79 Romantic AI Error:", error);
      return api.sendMessage(
        "❌ ওহো! কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্ঠা করো প্লিজ।",
        threadID,
        messageID
      );
    }
  }
};
