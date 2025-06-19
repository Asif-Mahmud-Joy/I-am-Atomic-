const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ============================== ⚡️ CONFIGURATION ⚡️ ============================== //
const ADMIN_ID = "61571630409265"; // Replace with your admin ID
const IMGUR_TOKEN = "Bearer edd3135472e670b475101491d1b0e489d319940f";
const BANNER_IMAGE = "https://files.catbox.moe/qptlr8.mp4"; // Optional decorative banner
// ================================================================================= //

const baseApiUrl = async () => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return response.data.mahmud;
  } catch (error) {
    console.error("Failed to fetch API URL:", error);
    return "https://fallback-api.example.com";
  }
};

// =============================== 🎨 DESIGN SYSTEM 🎨 ============================== //
const design = {
  header: "✨ 𝗔𝗟𝗕𝗨𝗠 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗦𝗬𝗦𝗧𝗘𝗠 ✨",
  footer: "♾️ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝐀𝐬𝐢𝐟 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲𝘀",
  separator: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  emoji: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    media: "🎬",
    add: "➕",
    list: "📋",
    next: "⏭️",
    admin: "👑"
  },
  styles: {
    category: "▸",
    highlight: "🌟",
    page: "📄"
  }
};

const formatMessage = (content) => {
  return `${design.emoji.info} ${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ================================================================================= //

module.exports = { 
  config: { 
    name: "album", 
    version: "2.0", 
    role: 0, 
    author: "Asif", 
    category: "media", 
    guide: { 
      en: "{p}{n} [page]\n{p}{n} add [category] [URL]\n{p}{n} list"
    }, 
  },

  onStart: async function ({ api, event, args }) { 
    try {
      const apiUrl = await baseApiUrl();
      const command = args[0]?.toLowerCase();

      // ➕ ADD MEDIA COMMAND
      if (command === "add") {
        if (!args[1]) {
          return api.sendMessage(
            formatMessage(`𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗽𝗲𝗰𝗶𝗳𝘆 𝗮 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆!\n${design.emoji.info} 𝗨𝘀𝗮𝗴𝗲: !album add [category]`),
            event.threadID, event.messageID
          );
        }

        const category = args[1].toLowerCase();
        const restricted = ["18+", "horny"];
        
        // 👑 ADMIN CHECK FOR RESTRICTED CATEGORIES
        if (restricted.includes(category) && event.senderID !== ADMIN_ID) {
          return api.sendMessage(
            formatMessage(`${design.emoji.admin} 𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆! 𝗢𝗻𝗹𝘆 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝗮𝗱𝗱 𝘁𝗼 ${category}`),
            event.threadID, event.messageID
          );
        }

        let mediaUrl = "";

        // 🖼️ HANDLE ATTACHMENT
        if (event.messageReply?.attachments?.[0]) {
          const attachment = event.messageReply.attachments[0];
          if (attachment.type !== "video") {
            return api.sendMessage(
              formatMessage(`${design.emoji.error} 𝗢𝗻𝗹𝘆 𝘃𝗶𝗱𝗲𝗼 𝗮𝘁𝘁𝗮𝗰𝗵𝗺𝗲𝗻𝘁𝘀 𝗮𝗿𝗲 𝗮𝗹𝗹𝗼𝘄𝗲𝗱!`),
              event.threadID, event.messageID
            );
          }
          mediaUrl = attachment.url;
        } 
        // 🔗 HANDLE URL
        else if (args[2]) {
          mediaUrl = args[2];
        } 
        else {
          return api.sendMessage(
            formatMessage(`${design.emoji.error} 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗶𝗱𝗲𝗼 𝗨𝗥𝗟 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝘃𝗶𝗱𝗲𝗼 𝗺𝗲𝘀𝘀𝗮𝗴𝗲!`),
            event.threadID, event.messageID
          );
        }

        // ☁️ UPLOAD TO IMGUR
        try {
          const imgurResponse = await axios.post(
            "https://api.imgur.com/3/upload", 
            { image: mediaUrl }, 
            { headers: { Authorization: IMGUR_TOKEN, "Content-Type": "application/json" } }
          );
          
          const imgurLink = imgurResponse.data?.data?.link;
          if (!imgurLink) throw new Error("Imgur upload failed");

          // 📤 ADD TO ALBUM
          const uploadResponse = await axios.post(`${apiUrl}/api/album/add`, { category, videoUrl: imgurLink });
          return api.sendMessage(
            formatMessage(`${design.emoji.success} ${uploadResponse.data.message}\n🔗 ${imgurLink}`),
            event.threadID, event.messageID
          );
        } catch (error) {
          console.error("Upload error:", error);
          return api.sendMessage(
            formatMessage(`${design.emoji.error} 𝗨𝗽𝗹𝗼𝗮𝗱 𝗳𝗮𝗶𝗹𝗲𝗱!\n${error.response?.data?.error || error.message}`),
            event.threadID, event.messageID
          );
        }
      }

      // 📋 LIST COMMAND
      if (command === "list") {
        try {
          const response = await axios.get(`${apiUrl}/api/album/list`);
          return api.sendMessage(
            formatMessage(`📊 𝗩𝗶𝗱𝗲𝗼 𝗦𝘁𝗮𝘁𝗶𝘀𝘁𝗶𝗰𝘀:\n${response.data.message}`),
            event.threadID, event.messageID
          );
        } catch (error) {
          return api.sendMessage(
            formatMessage(`${design.emoji.error} 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝘃𝗶𝗱𝗲𝗼 𝗹𝗶𝘀𝘁!`),
            event.threadID, event.messageID
          );
        }
      }

      // 🌟 CATEGORY SELECTION UI
      const displayNames = [
        "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨",
        "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨",
        "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨", "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨",
        "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐏𝐮𝐛𝐠 𝐯𝐢𝐝𝐞𝐨", "𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨"
      ];
      
      const itemsPerPage = 8;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(displayNames.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return api.sendMessage(
          formatMessage(`${design.emoji.error} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗽𝗮𝗴𝗲! 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗹𝗲𝗰𝘁 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝟭-${totalPages}`),
          event.threadID, event.messageID
        );
      }

      const startIndex = (page - 1) * itemsPerPage;
      const displayedCategories = displayNames.slice(startIndex, startIndex + itemsPerPage);

      // 🎨 VISUAL DESIGN FOR CATEGORY LIST
      let message = `📁 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝗲𝘀:\n${design.separator}\n`;
      message += displayedCategories.map((cat, i) => 
        `${design.styles.highlight} ${startIndex + i + 1}. ${cat} ${design.styles.category}`
      ).join("\n");
      
      message += `\n${design.separator}\n`;
      message += `${design.styles.page} 𝗣𝗮𝗴𝗲 ${page}/${totalPages}`;
      
      if (page < totalPages) {
        message += `\n${design.emoji.next} 𝗧𝘆𝗽𝗲 "!album ${page + 1}" 𝗳𝗼𝗿 𝗻𝗲𝘅𝘁 𝗽𝗮𝗴𝗲`;
      }

      // ✨ SEND WITH TYPER EFFECT
      api.sendMessage(formatMessage(message), event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          page,
          startIndex,
          displayNames,
          realCategories: [
            "funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple",
            "flower", "bikecar", "love", "lyrics", "cat", "18+", "freefire",
            "football", "baby", "friend", "pubg", "aesthetic"
          ],
          captions: [
            "😂 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝗳𝘂𝗻𝗻𝘆 𝘃𝗶𝗱𝗲𝗼!",
            "🕌 𝗜𝘀𝗹𝗮𝗺𝗶𝗰 𝘃𝗶𝗱𝗲𝗼 𝗱𝗲𝗹𝗶𝘃𝗲𝗿𝗲𝗱!",
            "😢 𝗦𝗮𝗱 𝘃𝗶𝗱𝗲𝗼 𝗶𝗻𝗰𝗼𝗺𝗶𝗻𝗴...",
            "🎌 𝗔𝗻𝗶𝗺𝗲 𝗺𝗮𝗴𝗶𝗰 𝗳𝗼𝗿 𝘆𝗼𝘂!",
            "🎧 𝗟𝗼𝗙𝗜 𝘃𝗶𝗯𝗲𝘀 𝗮𝘁𝘁𝗮𝗰𝗵𝗲𝗱!",
            "😎 𝗔𝘁𝘁𝗶𝘁𝘂𝗱𝗲 𝘃𝗶𝗱𝗲𝗼 𝗿𝗲𝗮𝗱𝘆!",
            "🔥 𝗛𝗼𝘁 𝗰𝗼𝗻𝘁𝗲𝗻𝘁 𝗶𝗻𝗰𝗼𝗺𝗶𝗻𝗴!",
            "💑 𝗖𝗼𝘂𝗽𝗹𝗲 𝗴𝗼𝗮𝗹𝘀 𝗮𝗰𝗵𝗶𝗲𝘃𝗲𝗱!",
            "🌸 𝗙𝗹𝗼𝘄𝗲𝗿 𝗽𝗼𝘄𝗲𝗿 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!",
            "🚗 𝗕𝗶𝗸𝗲 & 𝗖𝗮𝗿 𝗮𝗱𝘃𝗲𝗻𝘁𝘂𝗿𝗲!",
            "💘 𝗟𝗼𝘃𝗲 𝗶𝘀 𝗶𝗻 𝘁𝗵𝗲 𝗮𝗶𝗿!",
            "🎶 𝗟𝘆𝗿𝗶𝗰𝘀 𝘃𝗶𝗱𝗲𝗼 𝗳𝗼𝗿 𝘆𝗼𝘂!",
            "🐱 𝗖𝗮𝘁 𝘃𝗶𝗱𝗲𝗼 𝗱𝗲𝗹𝗶𝘃𝗲𝗿𝗲𝗱!",
            "🔞 𝗘𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁!",
            "🎮 𝗙𝗿𝗲𝗲𝗙𝗶𝗿𝗲 𝗴𝗮𝗺𝗲𝗽𝗹𝗮𝘆!",
            "⚽ 𝗙𝗼𝗼𝘁𝗯𝗮𝗹𝗹 𝗵𝗶𝗴𝗵𝗹𝗶𝗴𝗵𝘁𝘀!",
            "👶 𝗖𝘂𝘁𝗲 𝗯𝗮𝗯𝘆 𝘃𝗶𝗱𝗲𝗼!",
            "👫 𝗙𝗿𝗶𝗲𝗻𝗱𝘀𝗵𝗶𝗽 𝗴𝗼𝗮𝗹𝘀!",
            "📱 𝗣𝗨𝗕𝗚 𝗺𝗼𝗺𝗲𝗻𝘁𝘀!",
            "🎨 𝗔𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰 𝘃𝗶𝘀𝘂𝗮𝗹𝘀!"
          ]
        });
      }, event.messageID);

    } catch (error) {
      console.error("Command error:", error);
      api.sendMessage(
        formatMessage(`${design.emoji.error} 𝗦𝘆𝘀𝘁𝗲𝗺 𝗲𝗿𝗿𝗼𝗿! 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.`),
        event.threadID, event.messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      api.unsendMessage(Reply.messageID);
      const choice = parseInt(event.body);
      const index = choice - 1;

      if (isNaN(choice) || index < 0 || index >= Reply.realCategories.length) {
        return api.sendMessage(
          formatMessage(`${design.emoji.error} 𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿!`),
          event.threadID, event.messageID
        );
      }

      const category = Reply.realCategories[index];
      const caption = Reply.captions[index];
      const restricted = ["18+", "horny"];
      
      // 👑 ADMIN CHECK FOR RESTRICTED CONTENT
      if (restricted.includes(category) && event.senderID !== ADMIN_ID) {
        return api.sendMessage(
          formatMessage(`${design.emoji.admin} 𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝗰𝗼𝗻𝘁𝗲𝗻𝘁! 𝗢𝗻𝗹𝘆 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝗮𝗰𝗰𝗲𝘀𝘀 ${category}`),
          event.threadID, event.messageID
        );
      }

      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/album/videos/${category}?userID=${event.senderID}`);

      if (!response.data.success || !response.data.videos?.length) {
        return api.sendMessage(
          formatMessage(`${design.emoji.error} 𝗡𝗼 𝘃𝗶𝗱𝗲𝗼𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 ${category} 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆!`),
          event.threadID, event.messageID
        );
      }

      const randomVideoUrl = response.data.videos[Math.floor(Math.random() * response.data.videos.length)];
      
      // 🎥 STREAM VIDEO WITHOUT SAVING
      const videoResponse = await axios.get(randomVideoUrl, { 
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage({
        body: `${design.emoji.media} ${caption}\n🔗 ${randomVideoUrl}`,
        attachment: videoResponse.data
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("Reply error:", error);
      api.sendMessage(
        formatMessage(`${design.emoji.error} 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗹𝗼𝗮𝗱 𝘃𝗶𝗱𝗲𝗼! 𝗘𝗿𝗿𝗼𝗿: ${error.message}`),
        event.threadID, event.messageID
      );
    }
  }
};
