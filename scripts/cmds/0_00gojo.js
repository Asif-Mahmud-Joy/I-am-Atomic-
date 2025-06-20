const fetch = require("node-fetch");

const OPENROUTER_API_KEY = "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";

async function gojoAIReply({ api, event, args }) {
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(
      `☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━
❌ *ইনপুট রিকুয়েস্ট*
📝 কিছু লিখতে হবে, ভাই!
💡 যেমন: gojo_v3 কে তুমি সবচেয়ে ভালো বন্ধু হিসেবে মনে করো?
━━━━━━━━━━━━━━━━━━`,
      event.threadID,
      event.messageID
    );
  }

  // Show typing animation
  if (typeof api.sendMessageTyping === "function") {
    api.sendMessageTyping(event.threadID, true);
  }

  // Send initial processing message
  const processingMsg = await api.sendMessage(
    `☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🧠 *প্রসেসিং রিকুয়েস্ট...*
🔍 কোয়েরি: ${prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}
🔄 ডিপসিক মডেল লোড হচ্ছে...
⏳ একটু অপেক্ষা করো ভাই...
━━━━━━━━━━━━━━━━━━`,
    event.threadID
  );

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "system",
            content: "You are Gojo AI, an advanced AI assistant with a mature tone. Respond in Bengali unless asked otherwise. Be helpful, witty, and slightly sarcastic."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
      throw new Error("Gojo কিছু বুঝতে পারেনি।");
    }

    // Stop typing animation
    if (typeof api.sendMessageTyping === "function") {
      api.sendMessageTyping(event.threadID, false);
    }

    // Format the AI response
    const aiResponse = data.choices[0].message.content.trim();
    const reply = `☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━
💬 *ইউজার কোয়েরি:*
${prompt}

✨ *গোজো'র উত্তর:*
${aiResponse}

🔧 *সিস্টেম স্ট্যাটাস:*
🔄 মডেল: DeepSeek-R1-0528
⏱️ লেটেন্সি: ${data.usage?.total_tokens ? data.usage.total_tokens + ' টোকেন' : 'N/A'}
━━━━━━━━━━━━━━━━━━
⚡ *ভার্সন ৩.০ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍* ⚛️`,
      event.threadID,
      processingMsg.messageID
    );
  } catch (error) {
    // Stop typing animation
    if (typeof api.sendMessageTyping === "function") {
      api.sendMessageTyping(event.threadID, false);
    }

    console.error("Gojo API Error:", error);

    api.sendMessage(
      `☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐎𝐉𝐎 𝐀𝐈* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *সিস্টেম এরর!*
🔧 টেকনিক্যাল ডিটেইল: ${error.message || 'অজানা সমস্যা'}

💡 *সমাধানের উপায়:*
• ইন্টারনেট কানেকশন চেক করুন
• কিছুক্ষণ পর আবার চেষ্টা করুন
• অ্যাডমিনকে জানান
━━━━━━━━━━━━━━━━━━
⚙️ API Status: ${error.message.includes('API Error') ? 'অফলাইন' : 'অস্থিতিশীল'}`,
      event.threadID,
      processingMsg.messageID
    );
  }
}

module.exports = {
  config: {
    name: "gojo_v3",
    version: "3.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "Gojo AI - পরিপক্ক টোনে কথোপকথন",
    longDescription: "গোজো AI এর সাথে কথোপকথন করুন, পরিপক্ক টোন এবং টাইপিং অ্যানিমেশন সহ",
    category: "AI",
    guide: {
      en: "{pn} [আপনার বার্তা]",
      bn: "{pn} [আপনার বার্তা]"
    }
  },

  onStart: gojoAIReply
};
