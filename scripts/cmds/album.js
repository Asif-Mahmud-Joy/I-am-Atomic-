const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

// ============================== ⚛️ ATOMIC CONFIGURATION ⚛️ ============================== //
const ADMIN_IDS = process.env.ADMIN_IDS?.split(",") || ["61571630409265"];
const IMGUR_TOKEN = process.env.IMGUR_TOKEN || "Bearer edd3135472e670b475101491d1b0e489d319940f";
const API_BASE_URL = "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json";
const FALLBACK_API = "https://fallback-api.example.com";
const VALID_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const TYPING_DELAY = 800; // 0.8 second typing simulation
// ======================================================================================= //

// =============================== ✨ ATOMIC DESIGN SYSTEM ✨ ============================== //
const design = {
  header: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗟𝗕𝗨𝗠 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛️",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆",
  separator: "❖━━━━━━━━━━━━━━━━━━━━━━━━━━━❖",
  emoji: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    media: "🎬",
    add: "📥",
    list: "📊",
    next: "⏭️",
    admin: "👑",
    processing: "⏳",
    atom: "⚛️"
  },
  styles: {
    category: "▸",
    highlight: "✨",
    page: "📄",
    bullet: "❖"
  },
  colors: {
    text: "🔷",
    success: "🟢",
    error: "🔴"
  }
};

const formatMessage = (content) => {
  return `${design.emoji.atom} ${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ======================================================================================= //

const getApiUrl = async () => {
  try {
    const response = await axios.get(API_BASE_URL, { timeout: 5000 });
    return response.data.mahmud;
  } catch (error) {
    console.warn("[Atomic] API Fetch Error:", error.message);
    return FALLBACK_API;
  }
};

module.exports = {
  config: {
    name: "album",
    aliases: ["atomic"],
    version: "4.0",
    author: "Asif Mahmud | Atomic Design by Grok",
    role: 0,
    shortDescription: {
      en: "Atomic video album system"
    },
    longDescription: {
      en: "Professional video management with atomic design principles"
    },
    category: "atomic",
    guide: {
      en: `{p}album [page] - View categories\n{p}album add [category] [URL] - Add video\n{p}album list - Show stats`
    }
  },

  langs: {
    en: {
      invalidPage: "❌ Invalid page! Please choose 1-%1",
      invalidCategory: "⚠️ Please specify a valid category!",
      invalidUrl: "⚠️ Please provide video URL or reply to video",
      invalidAttachment: "❌ Only video attachments allowed!",
      restrictedCategory: "👑 Restricted to admins only!",
      addSuccess: "✅ Video added to %1!\n⏰ %2\n🔗 %3",
      listSuccess: "📊 Video Statistics:\n%1",
      noVideos: "⚠️ No videos found in %1 category!",
      invalidReply: "❌ Please reply with valid number!",
      apiError: "🌐 API connection failed",
      imgurError: "🖼️ Imgur upload failed",
      videoError: "🎬 Video load error",
      error: "⚡ System error! Try again later",
      processing: "⏳ Processing your request...",
      availableCategories: "✨ 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦",
      pageInfo: "📄 Page %1/%2",
      nextPage: "⏭️ Type `!album %1` for next page",
      videoDelivered: "🎬 Video delivered!\n⏰ %1\n🔗 %2"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { messageID, threadID, senderID } = event;
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");

    // Atomic typing simulation
    const atomicSend = (content, attachment = null) => {
      api.setMessageReaction(design.emoji.processing, messageID, () => {}, true);
      
      setTimeout(() => {
        api.sendMessage(
          { 
            body: formatMessage(content),
            attachment 
          },
          threadID,
          () => {
            api.setMessageReaction("", messageID, () => {}, true);
          },
          messageID
        );
      }, TYPING_DELAY);
    };

    try {
      const apiUrl = await getApiUrl();
      const command = args[0]?.toLowerCase();

      // ➕ Add Media Command
      if (command === "add") {
        if (!args[1]) return atomicSend(getLang("invalidCategory"));

        const category = args[1].toLowerCase();
        const restricted = ["18+", "horny", "hanime"];
        
        if (restricted.includes(category) && !ADMIN_IDS.includes(senderID)) {
          return atomicSend(getLang("restrictedCategory"));
        }

        let mediaUrl = "";
        if (event.messageReply?.attachments?.[0]) {
          const attachment = event.messageReply.attachments[0];
          if (attachment.type !== "video") return atomicSend(getLang("invalidAttachment"));
          mediaUrl = attachment.url;
        } else if (args[2]) {
          mediaUrl = args[2];
        } else {
          return atomicSend(getLang("invalidUrl"));
        }

        // Atomic design processing message
        atomicSend(getLang("processing"));

        try {
          // Validate video
          const headResponse = await axios.head(mediaUrl, { timeout: 5000 });
          if (!VALID_VIDEO_TYPES.includes(headResponse.headers["content-type"])) {
            return atomicSend(getLang("invalidAttachment"));
          }
        } catch (error) {
          return atomicSend(getLang("invalidUrl"));
        }

        // Upload to Imgur
        try {
          const imgurResponse = await axios.post(
            "https://api.imgur.com/3/upload",
            { image: mediaUrl },
            { 
              headers: { 
                Authorization: IMGUR_TOKEN, 
                "Content-Type": "application/json" 
              }, 
              timeout: 10000 
            }
          );
          
          const imgurLink = imgurResponse.data?.data?.link;
          if (!imgurLink) throw new Error("Imgur upload failed");

          const uploadResponse = await axios.post(
            `${apiUrl}/api/album/add`,
            { category, videoUrl: imgurLink },
            { timeout: 10000 }
          );
          
          return atomicSend(getLang("addSuccess", category, time, imgurLink));
        } catch (error) {
          return atomicSend(getLang("imgurError"));
        }
      }

      // 📊 List Command
      if (command === "list") {
        atomicSend(getLang("processing"));
        
        try {
          const response = await axios.get(`${apiUrl}/api/album/list`, { timeout: 10000 });
          return atomicSend(getLang("listSuccess", response.data.message));
        } catch (error) {
          return atomicSend(getLang("apiError"));
        }
      }

      // ✨ Category Selection UI
      const displayNames = [
        "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨",
        "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨",
        "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨", "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨",
        "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐏𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨",
        "𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐫𝐚𝐠𝐨𝐧 𝐁𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐦𝐨𝐧 𝐒𝐥𝐚𝐲𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐕𝐢𝐝𝐞𝐨",
        "𝐒𝐨𝐥𝐨 𝐋𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨", "𝐓𝐨𝐤𝐲𝐨 𝐑𝐞𝐯𝐞𝐧𝐠𝐞𝐫𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐮𝐞 𝐋𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐌𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐚𝐭𝐡 𝐍𝐨𝐭𝐞 𝐕𝐢𝐝𝐞𝐨",
        "𝐎𝐧𝐞 𝐏𝐢𝐞𝐜𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐤𝐚𝐦𝐨𝐭𝐨 𝐃𝐚𝐲𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐖𝐢𝐧𝐝 𝐁𝐫𝐞𝐚𝐤𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐎𝐧𝐞 𝐏𝐮𝐧𝐜𝐡 𝐌𝐚𝐧 𝐕𝐢𝐝𝐞𝐨",
        "𝐀𝐥𝐲𝐚 𝐑𝐮𝐬𝐬𝐢𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐮𝐞 𝐁𝐨𝐱 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐮𝐧𝐭𝐞𝐫 𝐱 𝐇𝐮𝐧𝐭𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐧𝐞𝐫 𝐋𝐢𝐟𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐚𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨"
      ];
      
      const realCategories = [
        "funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple", "flower", "bikecar",
        "love", "lyrics", "cat", "18+", "freefire", "football", "baby", "friend", "pubg", "aesthetic",
        "naruto", "dragon", "bleach", "demon", "jjk", "solo", "tokyo", "bluelock", "cman", "deathnote",
        "onepiece", "attack", "sakamoto", "wind", "onepman", "alya", "bluebox", "hunter", "loner", "hanime"
      ];
      
      const captions = [
        "😂 Funny Video!", "🕌 Islamic Video!", "😢 Sad Video!", "🎌 Anime Video!", "🎧 LoFI Vibes!",
        "😎 Attitude Video!", "🔥 Hot Content!", "💑 Couple Goals!", "🌸 Flower Power!", "🚗 Bike & Car!",
        "💘 Love Video!", "🎶 Lyrics Video!", "🐱 Cat Video!", "🔞 Exclusive Content!", "🎮 FreeFire!",
        "⚽ Football Highlights!", "👶 Cute Baby!", "👫 Friendship Goals!", "📱 PUBG Moments!", "🎨 Aesthetic!",
        "✨ Naruto Video!", "✨ Dragon Ball Video!", "✨ Bleach Video!", "✨ Demon Slayer Video!", "✨ Jujutsu Kaisen Video!",
        "✨ Solo Leveling Video!", "✨ Tokyo Revengers Video!", "✨ Blue Lock Video!", "✨ Chainsaw Man Video!", "✨ Death Note Video!",
        "✨ One Piece Video!", "✨ Attack on Titan Video!", "✨ Sakamoto Days Video!", "✨ Wind Breaker Video!", "✨ One Punch Man Video!",
        "✨ Alya Russian Video!", "✨ Blue Box Video!", "✨ Hunter x Hunter Video!", "✨ Loner Life Video!", "✨ Hanime Video!"
      ];

      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(displayNames.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return atomicSend(getLang("invalidPage", totalPages));
      }

      const startIndex = (page - 1) * itemsPerPage;
      const displayedCategories = displayNames.slice(startIndex, startIndex + itemsPerPage);

      // Atomic Design UI
      let message = `${design.emoji.highlight} ${getLang("availableCategories")}:\n`;
      message += design.styles.bullet + " " + displayedCategories.map((cat, i) => 
        `${design.colors.text} ${startIndex + i + 1}. ${cat} ${design.styles.category}`
      ).join(`\n${design.styles.bullet} `);
      
      message += `\n\n${design.emoji.page} ${getLang("pageInfo", page, totalPages)}`;
      
      if (page < totalPages) {
        message += `\n${design.emoji.next} ${getLang("nextPage", page + 1)}`;
      }

      atomicSend(message);

      // Set reply handler
      global.GoatBot.onReply.set(messageID, {
        commandName: this.config.name,
        messageID: messageID,
        author: senderID,
        page,
        startIndex,
        displayNames,
        realCategories,
        captions
      });
      
    } catch (error) {
      console.error("[AtomicError]", error);
      atomicSend(getLang("error"));
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    const { messageID, threadID, senderID } = event;
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");

    // Atomic typing simulation
    const atomicSend = (content, attachment = null) => {
      api.setMessageReaction(design.emoji.processing, messageID, () => {}, true);
      
      setTimeout(() => {
        api.sendMessage(
          { 
            body: formatMessage(content),
            attachment 
          },
          threadID,
          () => {
            api.setMessageReaction("", messageID, () => {}, true);
            api.unsendMessage(Reply.messageID);
          },
          messageID
        );
      }, TYPING_DELAY);
    };

    try {
      const choice = parseInt(event.body);
      const index = choice - 1;

      if (isNaN(choice) || index < 0 || index >= Reply.realCategories.length) {
        return atomicSend(getLang("invalidReply"));
      }

      const category = Reply.realCategories[index];
      const caption = Reply.captions[index];
      const restricted = ["18+", "horny", "hanime"];
      
      if (restricted.includes(category) && !ADMIN_IDS.includes(senderID)) {
        return atomicSend(getLang("restrictedCategory"));
      }

      atomicSend(getLang("processing"));

      const apiUrl = await getApiUrl();
      const response = await axios.get(
        `${apiUrl}/api/album/videos/${category}?userID=${senderID}`,
        { timeout: 10000 }
      );

      if (!response.data.success || !response.data.videos?.length) {
        return atomicSend(getLang("noVideos", category));
      }

      const randomVideoUrl = response.data.videos[Math.floor(Math.random() * response.data.videos.length)];
      
      const videoResponse = await axios.get(randomVideoUrl, {
        responseType: "stream",
        headers: { "User-Agent": "AtomicAlbum/4.0" },
        timeout: 15000
      });

      return atomicSend(
        `${caption}\n${getLang("videoDelivered", time, randomVideoUrl)}`,
        videoResponse.data
      );
    } catch (error) {
      console.error("[AtomicReplyError]", error);
      atomicSend(getLang("videoError"));
    }
  }
};
