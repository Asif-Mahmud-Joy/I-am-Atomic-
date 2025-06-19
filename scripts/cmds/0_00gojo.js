const fetch = require("node-fetch"); // Node 18+ এর জন্য optional, না থাকলে npm install node-fetch

const OPENROUTER_API_KEY = "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";

async function gojoAIReply({ api, event, args }) {
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(
      "❌ কিছু লিখতে হবে, ভাই! যেমন: `gojo তুমি কে?`",
      event.threadID,
      event.messageID
    );
  }

  // টাইপিং শুরু (যদি api তে ফাংশন থাকে)
  if (typeof api.sendMessageTyping === "function") {
    api.sendMessageTyping(event.threadID, true);
  }

  // ইউজারকে তথ্য দিচ্ছি
  await api.sendMessage("⏳ Gojo AI ভাবছে... একটু অপেক্ষা করো!", event.threadID, event.messageID);

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

    // টাইপিং বন্ধ
    if (typeof api.sendMessageTyping === "function") {
      api.sendMessageTyping(event.threadID, false);
    }

    // সুন্দরভাবে রেসপন্স পাঠাচ্ছি
    const reply = `👁️‍🗨️ Gojo বলছে:\n\n✨ ${data.choices[0].message.content.trim()}`;

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    // টাইপিং বন্ধ
    if (typeof api.sendMessageTyping === "function") {
      api.sendMessageTyping(event.threadID, false);
    }

    console.error("Gojo API Error:", error.message || error);

    api.sendMessage(
      "⚠️ দুঃখিত ভাই, Gojo একটু ব্রেক নিচ্ছে। পরে আবার চেষ্টা করো।",
      event.threadID,
      event.messageID
    );
  }
}

module.exports = {
  config: {
    name: "gojo_v3",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "Gojo AI এর সাথে কথা বলো, mature tone + typing animation সহ",
    category: "AI",
    guide: "{pn} তোমার মেসেজ"
  },

  onStart: gojoAIReply
};
