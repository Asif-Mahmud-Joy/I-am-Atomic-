const axios = require('axios');

// Enhanced OpenRouter API with atomic error handling
async function openRouterAPI(prompt) {
  const apiKey = "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";
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  try {
    const response = await axios.post(apiUrl,
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [{
          role: "system",
          content: "You're a romantic Bangladeshi AI companion. Respond in Banglish with emojis. Be poetic, flirtatious and dramatic!"
        }, {
          role: "user", 
          content: prompt
        }],
        temperature: 0.9,
        max_tokens: 350
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://atomic-romance.ai",
          "X-Title": "Atomic Romance Core"
        },
        timeout: 30000
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("☢️ Atomic API Error:", error.message);
    return null;
  }
}

// Enhanced romantic typing effect with atomic design
async function romanticTyping(api, threadID) {
  const phases = [
    "💞 Tomar jonno kichu moja moja kotha...",
    "⚛️ Atomic romance core processing...",
    "💖 Moner kotha gulo shajacche...",
    "💌 Tomake bhalobeshe lekha holo...",
    "✨ Ektu patience jaan..."
  ];
  
  const symbols = ["💫", "💘", "💓", "💝", "💗", "💟"];
  let currentPhase = 0;
  let sentMsg = null;
  
  // Start with first message
  try {
    sentMsg = await api.sendMessage(
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[0]} ${symbols[0]}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`,
      threadID
    );
  } catch (error) {
    console.error("Typing start error:", error);
  }
  
  // Animation loop (5 seconds total)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    
    const phaseIndex = Math.floor(i / 2) % phases.length;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const newContent = 
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[phaseIndex]} ${symbol}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`;
    
    try {
      if (sentMsg) await api.unsendMessage(sentMsg.messageID);
      sentMsg = await api.sendMessage(newContent, threadID);
    } catch (error) {
      // Fail silently
    }
  }
  
  return sentMsg;
}

// Atomic design message formatter
function formatAtomicMessage(title, content, emoji = "💘") {
  return (
    `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 ${title} ════ ☢️\n\n` +
    `${emoji} | ${content}\n\n` +
    `☣️ ────────────────────────────────\n` +
    `⚛️ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐑𝐎𝐌𝐀𝐍𝐂𝐄 𝐂𝐎𝐑𝐄 | ⏱️ ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}\n` +
    `💫 | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐄𝐏𝐒𝐄𝐄𝐊-𝐑𝟏`
  );
}

module.exports = {
  config: {
    name: "romanticopenai",
    version: "1.5.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "romance",
    shortDescription: {
      en: "Atomic-styled romantic AI with DeepSeek"
    },
    longDescription: {
      en: "Experience atomic-themed romantic conversations with advanced typing effects"
    },
    guide: {
      en: "{pn} [your romantic message]"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { messageID, threadID, messageReply } = event;
      let prompt = args.join(' ').trim();

      // Handle message replies
      if (messageReply && messageReply.body) {
        prompt = `${messageReply.body} ${prompt}`.trim();
      }

      // Show atomic design menu if no prompt
      if (!prompt) {
        const atomicMenu = formatAtomicMessage(
          "𝐑𝐎𝐌𝐀𝐍𝐂𝐄 𝐌𝐄𝐍𝐔", 
          "💌 Kichu bolo jaan, jeno ami tomake bhalobashi buchte pari...\n\n'romanticopenai tomake bhalobashi ki bhabe bolar?'\n'romanticopenai amake ekta kobita lekh'",
          "💝"
        );
        return api.sendMessage(atomicMenu, threadID, messageID);
      }

      // Show romantic typing animation
      await romanticTyping(api, threadID);

      // Create processing message with atomic design
      const processingMsg = await api.sendMessage(
        formatAtomicMessage(
          "𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆", 
          `"${prompt}" - Ei romantic query ta process hocche...`,
          "💞"
        ), 
        threadID
      );

      // Get AI response
      const aiResponse = await openRouterAPI(prompt);

      if (!aiResponse) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          formatAtomicMessage(
            "𝐄𝐑𝐑𝐎𝐑", 
            "❌ Dukkho, amar AI kichu bolte parlo na. Ektu pore try koro, jaan.",
            "💔"
          ),
          threadID,
          messageID
        );
      }

      // Format final response
      const finalResponse = formatAtomicMessage(
        "𝐑𝐎𝐌𝐀𝐍𝐓𝐈𝐂 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄", 
        aiResponse,
        "💖"
      );

      // Update message
      await api.unsendMessage(processingMsg.messageID);
      return api.sendMessage(finalResponse, threadID, messageID);

    } catch (error) {
      console.error("☢️ Atomic Romance Error:", error);
      return api.sendMessage(
        formatAtomicMessage(
          "𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄", 
          `⚠️ Error: ${error.message}\n\n💔 Jaan, maaf koro! Ami abar try korbo...`,
          "❌"
        ),
        event.threadID,
        event.messageID
      );
    }
  }
};
