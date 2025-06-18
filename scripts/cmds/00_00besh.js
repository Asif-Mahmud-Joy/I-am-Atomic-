const axios = require("axios");

module.exports = {
  config: {
    name: "besh24",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "5.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Chat with Besh using OpenAI",
    longDescription: "Chat with your gossip bestie Besh powered by OpenAI!",
    category: "ai",
    guide: "{p}besh24 <your text>"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    const lang = /[^\x00-\x7F]/.test(input) ? "bn" : "en";

    if (!input || input.length < 2) {
      const lines = [
        "oii-🥺🥹-ek🥄 chamoch bhalobasha diba-🤏🏻🙂",
        "janu-😇💕-ekta chumu debe-💋🥰",
        "babu-🌙✨-rater shopne dekha dibe-😴💖",
        "jaan-🌹🥰-ek fota hasi pathabe-😊✉️",
        "tumi-🌟😌-amar bhalobashar karon-🥰🎶",
        "love-😍🔥-tumi chhara nishash ta theme jai-😮‍💨💖",
        "love-❤️🥺-chokhe chokh rakhle hariye jabo-😍🌟",
        "😌-ami shudhu tomar kotha vabbo-💭🌟"
      ];
      const resp = lines[Math.floor(Math.random() * lines.length)];
      return api.sendMessage(resp, event.threadID, event.messageID);
    }

    try {
      // ✅ Free Public OpenAI proxy API (no key needed)
      const completion = await axios.post(
        "https://openai.angfuzsoft.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Tumi ekta flirty gossip Bangladeshi bestie. Banglish e moja moja replay diba.` },
            { role: "user", content: input }
          ],
          max_tokens: 150,
          temperature: 0.9
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const reply = completion.data.choices[0].message.content;
      return api.sendMessage(reply, event.threadID, event.messageID);
    } catch (err) {
      console.error("🛑 OpenAI Proxy API error:", err.message);
      return api.sendMessage("❌ Sorry jaan, API e problem hoise. Ektu pore abar try koro!", event.threadID, event.messageID);
    }
  }
};
