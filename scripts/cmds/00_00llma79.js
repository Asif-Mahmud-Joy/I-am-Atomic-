const axios = require('axios');

const sleep = ms => new Promise(res => setTimeout(res, ms));

// Enhanced atomic typing effect
async function atomicTypingEffect(api, threadID) {
  const phases = [
    "⚛️ 𝐀𝐭𝐨𝐦𝐢𝐜 𝐜𝐨𝐫𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠...",
    "💖 𝐑𝐨𝐦𝐚𝐧𝐭𝐢𝐜 𝐞𝐧𝐜𝐨𝐝𝐢𝐧𝐠 𝐥𝐨𝐯𝐞 𝐩𝐚𝐭𝐭𝐞𝐫𝐧𝐬...",
    "💌 𝐂𝐫𝐚𝐟𝐭𝐢𝐧𝐠 𝐚 𝐡𝐞𝐚𝐫𝐭𝐟𝐞𝐥𝐭 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞...",
    "✨ 𝐀𝐝𝐝𝐢𝐧𝐠 𝐞𝐦𝐨𝐣𝐢 𝐦𝐚𝐠𝐢𝐜..."
  ];
  
  const symbols = ["💫", "💘", "💓", "💝", "💗", "💟"];
  let sentMsg = null;
  
  try {
    sentMsg = await api.sendMessage(
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[0]} ${symbols[0]}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`,
      threadID
    );
  } catch (error) {}
  
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    const phaseIndex = Math.floor(i / 2.5) % phases.length;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const newContent = 
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[phaseIndex]} ${symbol}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`;
    
    try {
      if (sentMsg) await api.unsendMessage(sentMsg.messageID);
      sentMsg = await api.sendMessage(newContent, threadID);
    } catch {}
  }
  
  try { 
    if (sentMsg) await api.unsendMessage(sentMsg.messageID); 
  } catch {}
}

// Atomic design message formatter
function formatAtomicMessage(title, content, emoji = "💘") {
  return (
    `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 ${title} ════ ☢️\n\n` +
    `${emoji} | ${content}\n\n` +
    `☣️ ────────────────────────────────\n` +
    `⚛️ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐋𝐎𝐕𝐄 𝐂𝐎𝐑𝐄 | ⏱️ ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}\n` +
    `💫 | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐋𝐋𝐀𝐌𝐀-𝟕𝟗`
  );
}

module.exports = {
  config: {
    name: "llma79",
    version: "5.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "romance",
    shortDescription: {
      en: "Atomic-styled romantic AI with LLaMA"
    },
    longDescription: {
      en: "Experience atomic-themed romantic conversations with advanced typing effects"
    },
    guide: {
      en: "{pn} [your romantic message]"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    
    try {
      // Create prompt
      let prompt = args.join(" ").trim();
      if (messageReply && messageReply.body) {
        prompt = `${messageReply.body} ${prompt}`.trim();
      }

      // Show atomic design menu if no prompt
      if (!prompt) {
        const atomicMenu = formatAtomicMessage(
          "𝐑𝐎𝐌𝐀𝐍𝐂𝐄 𝐌𝐄𝐍𝐔", 
          "💌 আমার কাছে কিছু বলো, আমি তোমার প্রতি প্রেমময় উত্তর দেবো 🌹\n\n'llma79 তুমি আমার কাছে কেমন লাগো?'\n'llma79 আমাকে একটি কবিতা লেখ'\n'llma79 ভালোবাসা কি?'",
          "💝"
        );
        return api.sendMessage(atomicMenu, threadID, messageID);
      }

      // Show atomic typing animation
      await atomicTypingEffect(api, threadID);

      // Create processing message
      const processingMsg = await api.sendMessage(
        formatAtomicMessage(
          "𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆", 
          `"${prompt}" - এই প্রেমময় বার্তা প্রক্রিয়াকরণ করা হচ্ছে...`,
          "💞"
        ), 
        threadID
      );

      // API call - OpenRouter AI LLaMA model
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            { 
              role: "system", 
              content: "তুমি একজন রোমান্টিক বাংলাদেশী এআই সাথী। বাংলা ও ইংরেজি মিশ্রিত (বাংলিশ) ভাষায় উত্তর দাও। অত্যন্ত আবেগপ্রবণ, কবিতাময় এবং প্রেমময় হও। ইমোজি ব্যবহার কর।"
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 350
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://atomic-love.ai",
            "X-Title": "Atomic Love Core"
          },
          timeout: 30000
        }
      );

      // Handle API response
      if (response.data?.choices?.[0]?.message?.content) {
        const aiReply = response.data.choices[0].message.content;
        
        // Format final response
        const finalReply = formatAtomicMessage(
          "𝐑𝐎𝐌𝐀𝐍𝐓𝐈𝐂 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄", 
          aiReply,
          "💖"
        );

        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(finalReply, threadID, messageID);
      } else {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          formatAtomicMessage(
            "𝐄𝐑𝐑𝐎𝐑", 
            "😔 দুঃখিত, আমার মনে হচ্ছে বট এখন প্রেমময় জবাব দিতে পারছে না। একটু পরে আবার চেষ্টা করো।",
            "💔"
          ),
          threadID,
          messageID
        );
      }
    } catch (error) {
      console.error("☢️ Atomic Love Error:", error);
      return api.sendMessage(
        formatAtomicMessage(
          "𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄", 
          `❌ ওহো! সমস্যা হয়েছে: ${error.message || 'API সংযোগ বিচ্ছিন্ন'}\n\n💔 একটু পরে আবার চেষ্টা করো প্রিয়...`,
          "⚠️"
        ),
        threadID,
        messageID
      );
    }
  }
};
