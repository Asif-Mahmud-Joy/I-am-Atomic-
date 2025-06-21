const axios = require('axios');
const { getStreamFromURL } = global.utils;

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  HEADER: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥 ⚛️",
  FOOTER: "🎨 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗢𝗽𝗲𝗻𝗥𝗼𝘂𝘁𝗲𝗿 𝗔𝗜 🎨",
  SEPARATOR: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  ELEMENTS: {
    SUCCESS: "✅",
    ERROR: "❌",
    PROCESSING: "⏳",
    AVATAR: "🖼️",
    LIST: "📋",
    CHARACTER: "👤",
    TEXT: "✏️",
    SIGNATURE: "🖋️",
    ATOM: "⚛️"
  }
};

const formatAtomicMessage = (content) => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.ELEMENTS.ATOM} ${ATOMIC.HEADER} ${ATOMIC.ELEMENTS.ATOM} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

const CHARACTERS = [
  { id: 0, name: "Nezuko Kamado" },
  { id: 1, name: "Tanjiro Kamado" },
  { id: 2, name: "Sasuke Uchiha" },
  { id: 3, name: "Naruto Uzumaki" },
  { id: 4, name: "Gojo Satoru" },
  { id: 5, name: "Luffy" },
  { id: 6, name: "Levi Ackerman" },
  { id: 7, name: "Itachi Uchiha" },
  { id: 8, name: "Zero Two" },
  { id: 9, name: "Mikasa Ackerman" }
];
// ============================================================================ //

module.exports = {
  config: {
    name: "avatar",
    aliases: ["atomicav"],
    version: "7.0",
    author: "Asif Mahmud",
    cooldowns: 5,
    role: 0,
    shortDescription: "Create AI-powered avatars",
    longDescription: "Generate avatars using AI with atomic design elements",
    category: "image",
    guide: {
      en: `
        ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗨𝗜𝗗𝗘:
        {pn} <ID/Name> | <Text> | <Signature>
        
        🔹 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        {pn} Nezuko | Atomic User | Asif
        {pn} 5 | Premium Member | Signature
        
        {pn} list - Show character catalog
      `
    }
  },

  langs: {
    en: {
      processing: "⏳ Generating your atomic avatar with AI...",
      invalidChar: "❌ Only %1 characters available! Use ID < %1",
      charNotFound: "❌ Character '%1' not found in atomic database",
      success: "✅ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗!\n\n${ATOMIC.ELEMENTS.CHARACTER} 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿: %1\n⚛️ 𝗜𝗗: %2\n${ATOMIC.ELEMENTS.TEXT} 𝗧𝗲𝘅𝘁: %3\n${ATOMIC.ELEMENTS.SIGNATURE} 𝗦𝗶𝗴𝗻𝗮𝘁𝘂𝗿𝗲: %4",
      error: "❌ Avatar generation failed: %1",
      charList: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗛𝗔𝗥𝗔𝗖𝗧𝗘𝗥 𝗖𝗔𝗧𝗔𝗟𝗢𝗚:\n%1",
      missingInput: "⚠️ Required: <ID/Name> | <Text> | <Signature>",
      generatingPrompt: "🧠 Creating atomic avatar description...",
      creatingImage: "🎨 Generating avatar visualization..."
    }
  },

  onStart: async function ({ args, message, event, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    if (args[0]?.toLowerCase() === "list") {
      const list = CHARACTERS.map(c => `⚛️ ${c.id}. ${c.name}`).join("\n");
      return message.reply(
        formatAtomicMessage(getLang("charList", list))
      );
    }

    const input = args.join(" ").split("|").map(i => i.trim());
    const [charInput, bgText, signText] = input;

    if (!charInput || !bgText || !signText) {
      return message.reply(
        formatAtomicMessage(getLang("missingInput"))
      );
    }

    message.reply(
      formatAtomicMessage(getLang("processing"))
    );

    let charID, charName;

    // Find character
    if (!isNaN(charInput)) {
      charID = parseInt(charInput);
      if (charID >= CHARACTERS.length) {
        return message.reply(
          formatAtomicMessage(getLang("invalidChar", CHARACTERS.length))
        );
      }
      charName = CHARACTERS[charID].name;
    } else {
      const foundChar = CHARACTERS.find(c => 
        c.name.toLowerCase().includes(charInput.toLowerCase())
      );
      if (!foundChar) {
        return message.reply(
          formatAtomicMessage(getLang("charNotFound", charInput))
        );
      }
      charID = foundChar.id;
      charName = foundChar.name;
    }

    try {
      // Step 1: Generate AI prompt description
      message.reply(
        formatAtomicMessage(getLang("generatingPrompt"))
      );
      
      const OPENROUTER_API_KEY = "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";
      const promptResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3.3-8b-instruct:free",
          messages: [
            {
              role: "system",
              content: "You are an expert anime artist specializing in atomic design avatars."
            },
            {
              role: "user",
              content: `Create a detailed image prompt for an avatar with:
              - Character: ${charName}
              - Main Text: ${bgText}
              - Signature: ${signText}
              - Style: Atomic design (geometric shapes, vibrant colors, minimalist)
              - Format: Only return the image description text, nothing else`
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const aiPrompt = promptResponse.data.choices[0].message.content;
      
      // Step 2: Generate avatar image
      message.reply(
        formatAtomicMessage(getLang("creatingImage"))
      );
      
      const imageResponse = await axios.post(
        "https://api.vyro.ai/v1/imagine/api/generate",
        {
          prompt: aiPrompt,
          style: "anime",
          ratio: "1:1",
          priority: "HIGH"
        },
        {
          headers: {
            "Authorization": "Bearer vk-9YHrLd9u7Rw4i2XGc6TjKZg",
            "Content-Type": "application/json"
          },
          responseType: "json"
        }
      );

      const imageUrl = imageResponse.data.image.url;
      const imgStream = await getStreamFromURL(imageUrl, "avatar.jpg");
      
      await simulateTyping(api, event.threadID);
      
      message.reply({
        body: formatAtomicMessage(
          getLang("success", charName, charID, bgText, signText)
        ),
        attachment: imgStream
      });
      
    } catch (err) {
      console.error("Avatar Generation Error:", err.response?.data || err.message);
      message.reply(
        formatAtomicMessage(getLang("error", err.message))
      );
    }
  }
};
