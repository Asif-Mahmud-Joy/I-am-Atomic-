const axios = require('axios');

// OpenRouter AI থেকে রেসপন্স নেওয়ার ফাংশন
async function openRouterAPI(prompt) {
  const apiKey = "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"; // তোমার API কী এখানে বসাও
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  try {
    const response = await axios.post(apiUrl,
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API error:", error.message);
    return null;
  }
}

// রোমান্টিক টাইপিং এফেক্ট ফাংশন (কাজ হবে টাইপিং ইন্ডিকেটর হিসেবে)
async function romanticTyping(api, threadID, baseText = "💞 Tomar jonno kichu moja moja kotha...") {
  const dots = ["", ".", "..", "..."];
  let i = 0;
  let sentMsg;
  try {
    sentMsg = await api.sendMessage(baseText, threadID);
  } catch {
    // Ignore fail on first send
  }
  let elapsed = 0;
  const duration = 3000;
  const interval = 500;
  while (elapsed < duration) {
    await new Promise(r => setTimeout(r, interval));
    i = (i + 1) % dots.length;
    try {
      if (sentMsg) await api.unsendMessage(sentMsg.messageID);
      sentMsg = await api.sendMessage(baseText + dots[i], threadID);
    } catch {
      // Ignore errors to avoid crash
    }
    elapsed += interval;
  }
}

module.exports = {
  config: {
    name: "romanticopenai",
    version: "1.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "member",
    shortDescription: {
      en: "Romantic AI chat using OpenRouter API"
    },
    longDescription: {
      en: "Generate romantic AI responses with typing effect via OpenRouter public API."
    },
    guide: {
      en: "{pn} tomake bhalobashi ki bhabe bolar?"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { messageID, messageReply, threadID } = event;
      let prompt = args.join(' ').trim();

      // যদি কেউ মেসেজ রিপ্লাই করে প্রম্পট দেয়, সেটা যুক্ত করবো
      if (messageReply && messageReply.body) {
        prompt = `${messageReply.body} ${prompt}`.trim();
      }

      if (!prompt) {
        return api.sendMessage(
          "💔 Kichu bolo jaan, jeno ami tomake bhalobashi buchte pari. Usage: romanticopenai <kotha bolo>",
          threadID,
          messageID
        );
      }

      // টাইপিং এফেক্ট দেখাও
      await romanticTyping(api, threadID);

      // API কল করে রেসপন্স নাও
      const aiResponse = await openRouterAPI(prompt);

      if (!aiResponse) {
        return api.sendMessage(
          "❌ Dukkho, amar AI kichu bolte parlo na. Ektu pore try koro, jaan.",
          threadID,
          messageID
        );
      }

      // প্রেমময় মেসেজ ফরম্যাটিং
      const finalMsg = `💖 Tomar jonno AI theke ekta mitha kotha:\n\n${aiResponse}\n\n💌 Always tomake bhalobashi ❤️`;

      api.sendMessage(finalMsg, threadID, messageID);

    } catch (error) {
      console.error("RomanticOpenAI Error:", error);
      api.sendMessage(`❌ Error hoise: ${error.message}. Pore abar try koro.`, event.threadID, event.messageID);
    }
  }
};
