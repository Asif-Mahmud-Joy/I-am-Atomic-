const axios = require("axios");

module.exports = {
  config: {
    name: "☢𝐀𝐓𝐎𝐌𝐈𝐂⚛",
    version: "4.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Atomic Core System",
    longDescription: "Premium atomic information system with enhanced UI/UX",
    category: "system",
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api }) {
    try {
      const trigger = event.body?.toLowerCase().trim();
      if (trigger === "atomic") {
        // Premium atomic typing animation
        api.setMessageReaction("☢️", event.messageID, () => {}, true);
        
        // Atomic core animation sequence
        setTimeout(async () => {
          try {
            const videoUrl = "https://files.catbox.moe/pm6rfq.mp4";
            const response = await axios.get(videoUrl, { responseType: 'stream' });

            await message.reply({
              body: `☢️ ════════ ATOMIC CORE SYSTEM ════════ ☢️\n\n` +
                     `⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n` +
                     `☣️ ────────────────────────────────\n\n` +
                     `👑 𝗢𝘄𝗻𝗲𝗿 » 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱\n` +
                     `🤖 𝗕𝗼𝘁 » ☢𝐀𝐓𝐎𝐌𝐈𝐂⚛\n` +
                     `💠 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 » 𝟰.𝟬\n` +
                     `☢️ 𝗦𝘁𝗮𝘁𝘂𝘀 » 𝗢𝗽𝗲𝗿𝗮𝘁𝗶𝗼𝗻𝗮𝗹\n\n` +
                     `☣️ ────────────────────────────────\n` +
                     `⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵`,
              attachment: response.data
            });
            
            // Update reaction to completed state
            api.setMessageReaction("⚛️", event.messageID, () => {}, true);
          } catch (err) {
            console.error("ATOMIC SYSTEM ERROR:", err);
            api.setMessageReaction("☣️", event.messageID, () => {}, true);
          }
        }, 2500); // Enhanced 2.5-second typing simulation
      }
    } catch (err) {
      console.error("CRITICAL SYSTEM FAILURE:", err);
      message.reply("☢️ ATOMIC CORE FAILURE: SYSTEM RECOVERY INITIATED");
    }
  }
};
