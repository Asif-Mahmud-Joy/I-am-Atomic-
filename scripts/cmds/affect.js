const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "affect",
    aliases: ["atomicvibe", "quantumaffect"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Quantum Emotion Generator",
    longDescription: "Create atomic-grade emotion visuals with quantum AI",
    category: "⚡ Image Generation",
    guide: {
      en: "{pn} [@mention | reply | blank]"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐄𝐌𝐎𝐓𝐈𝐎𝐍 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🎭", "🌀", "💫"]
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
      // Determine quantum subject
      const uid = Object.keys(event.mentions)[0] || 
        (event.type === "message_reply" ? event.messageReply.senderID : event.senderID);
      
      const userName = await usersData.getName(uid);
      const avatarURL = await usersData.getAvatarUrl(uid);

      // Generate quantum emotion caption
      const quantumPrompt = `Generate a creative emotion-based caption for ${userName}'s profile picture. 
        Make it 1 sentence, poetic and science-themed. Include emojis. Example: 
        "Quantum vibes resonating through the cosmic field 🌌⚛️"`;
      
      const captionResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: "You are a quantum emotion generator creating poetic science-themed captions"
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
          timeout: 10000
        }
      );

      const quantumCaption = captionResponse.data.choices[0].message.content;

      // Generate atomic affect image
      const imgResponse = await axios.get(
        `https://api.devs-hub.xyz/affect?image=${encodeURIComponent(avatarURL)}`,
        { responseType: 'arraybuffer' }
      );

      // Save quantum image
      const imgPath = path.join(__dirname, "tmp", `quantum_affect_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));

      // Send quantum emotion
      message.reply({
        body: formatResponse(`${quantumCaption}\n\n🌀 Quantum Emotion for ${userName}`),
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (error) {
      console.error("Quantum Emotion Error:", error);
      message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐄𝐌𝐎𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐔𝐑𝐄\nCosmic resonance disrupted"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
