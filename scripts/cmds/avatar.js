const axios = require('axios');
const { getStreamFromURL } = global.utils;

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗔𝗡𝗜𝗠𝗘 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    AVATAR: "🖼️",
    LIST: "📋",
    COLOR: "🎨",
    PROCESSING: "⏳",
    CHARACTER: "👤",
    TEXT: "✏️",
    SIGNATURE: "✍️"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF"
  }
};

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━┛
${content}
${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

const ADMIN_ID = "61571630409265"; // Replace with actual admin ID
const PRIMARY_API = "https://goatbotserver.onrender.com/taoanhdep";
const FALLBACK_API = "https://imagegen-api.onrender.com/avatar-anime";
const API_KEY = "ntkhangGoatBot";

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ====================================================================================== //

// Fallback character list
const fallbackCharacters = [
  { stt: 0, name: "Nezuko Kamado" },
  { stt: 1, name: "Tanjiro Kamado" },
  { stt: 2, name: "Sasuke Uchiha" },
  { stt: 3, name: "Naruto Uzumaki" },
  { stt: 4, name: "Gojo Satoru" },
  { stt: 5, name: "Luffy" },
  { stt: 6, name: "Levi Ackerman" },
  { stt: 7, name: "Itachi Uchiha" },
  { stt: 8, name: "Zero Two" },
  { stt: 9, name: "Mikasa Ackerman" }
];

module.exports = {
  config: {
    name: "avatar",
    version: "3.0",
    author: "NTKhang & Asif Mahmud | Enhanced by Royal AI",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate royal anime avatars",
    longDescription: "Create premium anime-style avatars with character selection and custom text",
    category: "image",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} <ID or Name> | <Text> | <Signature> | [Color]
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        !avatar Nezuko | Team Royal | Asif | #FF0000
        !avatar 5 | Premium User | Signature | blue
        
        {pn} list - Show character list
      `,
      bn: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗔𝗩𝗔𝗧𝗔𝗥 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} <আইডি বা নাম> | <টেক্সট> | <স্বাক্ষর> | [রঙ]
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        !avatar Nezuko | Team Royal | Asif | #FF0000
        !avatar 5 | Premium User | Signature | blue
        
        {pn} list - ক্যারেক্টার তালিকা দেখান
      `
    }
  },

  langs: {
    en: {
      initImage: "👑 Crafting your royal avatar, please wait...",
      invalidCharacter: "⚠️ Only %1 characters available! Use ID less than this",
      notFoundCharacter: "❌ Character '%1' not found in royal collection",
      success: "👑 𝗥𝗢𝗬𝗔𝗟 𝗔𝗩𝗔𝗧𝗔𝗥 𝗥𝗘𝗔𝗗𝗬!\n${DESIGN.EMOJI.CHARACTER} Character: %1\n📌 ID: %2\n${DESIGN.EMOJI.TEXT} Text: %3\n${DESIGN.EMOJI.SIGNATURE} Signature: %4\n${DESIGN.EMOJI.COLOR} Color: %5",
      defaultColor: "Royal Default",
      error: "❌ Royal error: %1",
      characterList: "👑 𝗥𝗢𝗬𝗔𝗟 𝗖𝗛𝗔𝗥𝗔𝗖𝗧𝗘𝗥 𝗟𝗜𝗦𝗧:\n%1",
      missingInput: "⚠️ Please provide: <ID/Name> | <Text> | <Signature> | [Color]",
      processing: "⏳ Processing your royal avatar..."
    }
  },

  onStart: async function ({ args, message, event, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    if (args[0]?.toLowerCase() === "list") {
      try {
        const { data } = await axios.get(`${PRIMARY_API}/listavataranime?apikey=${API_KEY}`);
        const characters = data.data || fallbackCharacters;
        const charList = characters.map(c => `👑 ${c.stt}. ${c.name}`).join("\n");
        return message.reply(
          formatMessage(getLang("characterList", charList), "info")
        );
      } catch {
        const charList = fallbackCharacters.map(c => `👑 ${c.stt}. ${c.name}`).join("\n");
        return message.reply(
          formatMessage(getLang("characterList", charList), "info")
        );
      }
    }

    const input = args.join(" ").split("|").map(i => i.trim());
    const [charInput, bgText, signText, colorBg] = input;

    if (!charInput || !bgText || !signText) {
      return message.reply(
        formatMessage(getLang("missingInput"), "error")
      );
    }

    message.reply(
      formatMessage(getLang("processing"), "info")
    );

    let charID = null;
    let charName = null;
    let characters = fallbackCharacters;

    // Fetch character list
    try {
      const { data } = await axios.get(`${PRIMARY_API}/listavataranime?apikey=${API_KEY}`);
      characters = data.data || fallbackCharacters;
    } catch {
      characters = fallbackCharacters;
    }

    // Find character
    if (!isNaN(charInput)) {
      charID = parseInt(charInput);
      if (charID >= characters.length) {
        return message.reply(
          formatMessage(getLang("invalidCharacter", characters.length), "error")
        );
      }
      charName = characters[charID].name;
    } else {
      const foundChar = characters.find(c => 
        c.name.toLowerCase().includes(charInput.toLowerCase())
      );
      if (!foundChar) {
        return message.reply(
          formatMessage(getLang("notFoundCharacter", charInput), "error")
        );
      }
      charID = foundChar.stt;
      charName = foundChar.name;
    }

    // Generate avatar
    const params = {
      id: charID,
      chu_Nen: bgText,
      chu_Ky: signText,
      apikey: API_KEY
    };
    if (colorBg) params.colorBg = colorBg;

    try {
      const imgStream = await getStreamFromURL(`${PRIMARY_API}/avataranime`, "avatar.png", { params });
      
      await simulateTyping(api, event.threadID);
      
      message.reply({
        body: formatMessage(
          getLang("success", charName, charID, bgText, signText, colorBg || getLang("defaultColor")), 
          "success"
        ),
        attachment: imgStream
      });
    } catch (primaryError) {
      try {
        // Try fallback API
        const imgStream = await getStreamFromURL(FALLBACK_API, "avatar.png", { params });
        
        await simulateTyping(api, event.threadID);
        
        message.reply({
          body: formatMessage(
            getLang("success", charName, charID, bgText, signText, colorBg || getLang("defaultColor")), 
            "success"
          ),
          attachment: imgStream
        });
      } catch (fallbackError) {
        message.reply(
          formatMessage(getLang("error", "Failed to generate royal avatar"), "error")
        );
      }
    }
  }
};
