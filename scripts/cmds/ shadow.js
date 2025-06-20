const axios = require("axios");

module.exports = {
  config: {
    name: "☢𝐀𝐓𝐎𝐌𝐈𝐂⚛",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Atomic information system",
    longDescription: "Premium response to Atomic keyword with bot & owner information",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api }) {
    try {
      const trigger = event.body?.toLowerCase().trim();
      if (trigger === "atomic") {
        // Show typing animation
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
        
        setTimeout(async () => {
          try {
            const videoUrl = "https://files.catbox.moe/pm6rfq.mp4";
            const response = await axios.get(videoUrl, { responseType: 'stream' });

            await message.reply({
              body: `☢️ ━━━━━━━━━━━━━━━━━━━ ☢️\n\n⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢\n\n👑 𝗢𝘄𝗻𝗲𝗿: 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱\n\n🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ☢𝐀𝐓𝐎𝐌𝐈𝐂⚛\n\n💠 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: 𝟯.𝟬\n\n☢️ ━━━━━━━━━━━━━━━━━━━ ☢️\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵`,
              attachment: response.data
            });
            
            // Remove typing indicator
            api.setMessageReaction("", event.messageID, () => {}, true);
          } catch (err) {
            console.error("Error sending Atomic response:", err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
          }
        }, 2000); // 2-second typing simulation
      }
    } catch (err) {
      console.error("Error in Atomic command:", err);
      message.reply("⚠️ System error detected. Please try again later.");
    }
  }
};
