const axios = require("axios");
const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "ai",
    aliases: ["atom", "quantumai"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    role: 0,
    shortDescription: "⚛️ Quantum Neural Assistant",
    longDescription: "Access atomic-grade intelligence from quantum neural networks",
    category: "⚡ AI",
    guide: {
      en: "{pn} [query] or reply to an image"
    }
  },

  handleCommand: async function ({ message, event, args, usersData }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐍𝐄𝐔𝐑𝐀𝐋 𝐀𝐒𝐒𝐈𝐒𝐓𝐀𝐍𝐓 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🧠", "🔍", "💡"]
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
      const userName = await usersData.getName(event.senderID);
      let quantumPrompt = args.join(" ");

      // Handle image attachments
      if (event.type === "message_reply" && 
          event.messageReply.attachments?.[0]?.type === "photo") {
        const uploaded = await uploadImgbb(event.messageReply.attachments[0].url);
        quantumPrompt = `[Image Analysis] ${quantumPrompt} - Image URL: ${uploaded.image.url}`;
      }

      // Quantum intelligence parameters
      const quantumResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: "You are a quantum neural assistant providing atomic-grade intelligence. " +
                       "Respond in a poetic, science-themed style with emojis. " +
                       "Format complex answers with bullet points. " +
                       `User's name: ${userName}`
            },
            {
              role: "user",
              content: quantumPrompt
            }
          ],
          max_tokens: 2000
        },
        {
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      let quantumAnswer = quantumResponse.data.choices[0].message.content;
      
      // Format the quantum answer
      quantumAnswer = quantumAnswer
        .replace(/{name}/g, userName)
        .replace(/\*\*(.*?)\*\*/g, "🔰 $1") // Convert markdown bold to atomic
        .replace(/\n\s*-\s*/g, "\n• ")      // Convert dashes to bullet points
        .replace(/```(.*?)```/gs, "⚙️ $1"); // Format code blocks

      // Check if response contains image URL
      const imgUrlMatch = quantumAnswer.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif)/i);
      let imageAttachment = null;
      
      if (imgUrlMatch) {
        quantumAnswer = quantumAnswer.replace(imgUrlMatch[0], "");
        imageAttachment = await getStreamFromURL(imgUrlMatch[0]);
      }

      // Send quantum intelligence
      return message.reply({
        body: formatResponse(quantumAnswer),
        attachment: imageAttachment
      });

    } catch (error) {
      console.error("Quantum AI Error:", error);
      return message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐎𝐕𝐄𝐑𝐋𝐎𝐀𝐃\nNeural pathways temporarily disrupted"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    if (args.length > 0) {
      return this.handleCommand({ message, event, args, usersData });
    }
    return message.reply("⚛️ Please provide a quantum query after the command");
  },

  onChat: async function ({ message, event, args, usersData }) {
    if (args[0]?.toLowerCase() === "ai" || 
        args[0]?.toLowerCase() === "atom" || 
        args[0]?.toLowerCase() === "quantumai") {
      return this.handleCommand({ message, event, args: args.slice(1), usersData });
    }
  }
};
