const axios = require('axios');

module.exports = {
  config: {
    name: "advice",
    aliases: ["quantumadvice", "atomicadvice"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Quantum Wisdom Generator",
    longDescription: "Access atomic-grade wisdom from quantum neural networks",
    category: "⚡ Study",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐖𝐈𝐒𝐃𝐎𝐌 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🧠", "🔮", "💡"]
    };
    // ================================================================================== //

    const formatResponse = (content) => {
      return [
        design.header,
        design.separator,
        content,
        design.separator,
        design.footer
      ].join("\n");
    };

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      // Quantum wisdom parameters
      const quantumPrompt = "Generate a profound piece of life advice in 1 sentence. "
        + "Then translate it into Bangla after the English version. "
        + "Make it insightful and philosophical.";

      // Access quantum neural network
      const quantumResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: "You are a quantum wisdom generator providing atomic-grade insights about life."
            },
            {
              role: "user",
              content: quantumPrompt
            }
          ]
        },
        {
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const quantumWisdom = quantumResponse.data.choices[0].message.content;
      
      // Format quantum output
      const wisdomLines = quantumWisdom.split('\n');
      const formattedWisdom = wisdomLines.map(line => {
        if (line.includes('🇧🇩')) 
          return `🇧🇩 ${line.replace('🇧🇩', '').trim()}`;
        if (line.includes('🌐')) 
          return `🌐 ${line.replace('🌐', '').trim()}`;
        return line;
      }).join('\n');

      return api.sendMessage(
        formatResponse(formattedWisdom),
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error("Quantum Wisdom Error:", error);
      
      // Fallback to classical wisdom
      try {
        const fallbackRes = await axios.get("https://api.adviceslip.com/advice");
        const englishWisdom = fallbackRes.data.slip.advice;
        const banglaWisdom = await this.translateToBangla(englishWisdom);
        
        return api.sendMessage(
          formatResponse(`🌐 ${englishWisdom}\n🇧🇩 ${banglaWisdom}`),
          event.threadID,
          event.messageID
        );
      } catch (fallbackError) {
        return api.sendMessage(
          formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nWisdom generation failed"),
          event.threadID,
          event.messageID
        );
      }
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  },

  translateToBangla: async function(text) {
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(text)}`
      );
      return response.data[0].map(item => item[0]).join('');
    } catch (error) {
      return "অনুবাদে সমস্যা হয়েছে";
    }
  }
};
