const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// ⚛️ Atomic design configuration
const ATOMIC_EMOJIS = {
  processing: "⚛️",
  success: "✅",
  error: "❌",
  nsfw: "🔞",
  sfw: "🔒",
  tags: "🏷️",
  gif: "🎬"
};

module.exports = {
  config: {
    name: "anigif",
    aliases: ["atomic-gif"],
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | Atomic Design",
    version: "3.0",
    role: 0,
    category: "𝗠𝗘𝗗𝗜𝗔",
    shortDescription: {
      en: "⚛️ Generate atomic anime GIFs"
    },
    longDescription: {
      en: "Create high-quality anime GIFs with atomic precision using tags"
    },
    guide: {
      en: "{pn} <tag> | type {pn} alone to see tag list"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { threadID, messageID, senderID } = event;
    
    // Atomic design helper function
    const atomicMessage = (content) => {
      return `╔═══════════════════════╗
║   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗚𝗜𝗙  ⚛️   ║
╚═══════════════════════╝

${content}
❖━━━━━━━━━━━━━━━━━━━━━━━━━━━❖`;
    };

    // 🔐 Permission Checking System
    const approvedMain = fs.readJSONSync(`${__dirname}/assist_json/approved_main.json`, { throws: false }) || [];
    const approvedNSFW = fs.readJSONSync(`${__dirname}/assist_json/approved_ids.json`, { throws: false }) || [];
    const bypassIds = fs.readJSONSync(`${__dirname}/assist_json/bypass_id.json`, { throws: false }) || [];

    const uid = senderID;
    const tid = threadID;

    // ⚛️ Atomic permission check
    if (!bypassIds.includes(uid) && !approvedMain.includes(tid)) {
      const p = global.utils.getPrefix(tid);
      const msg = atomicMessage(
        `🔒 Command Locked!\n\n` +
        `⚡ Reason: Atomic GIF is a premium command\n` +
        `💡 Use ${p}requestMain to request access`
      );
      
      const msgSend = await message.reply(msg);
      setTimeout(() => message.unsend(msgSend.messageID), 30000);
      return;
    }

    // ✅ All Tags
    const sfwTags = ["bite", "blush", "comfy", "cry", "cuddle", "dance", "eevee", "fluff", "holo", "hug", "icon", "kiss", "kitsune", "lick", "neko", "okami", "pat", "poke", "senko", "sairo", "slap", "smile", "tail", "tickle"];
    const nsfwTags = ["anal", "blowjob", "cum", "fuck", "pussylick", "solo", "threesome_fff", "threesome_ffm", "threesome_mmf", "yaio", "yuri"];
    const allTags = [...sfwTags, ...nsfwTags];

    const tag = args[0]?.toLowerCase();

    // 📜 Show all tags if none provided
    if (!tag) {
      let msg = `${ATOMIC_EMOJIS.tags} 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗧𝗔𝗚𝗦\n\n`;
      msg += `✨ 𝗦𝗙𝗪 𝗧𝗮𝗴𝘀:\n${sfwTags.join(", ")}`;
      
      if (bypassIds.includes(uid) || approvedNSFW.includes(tid)) {
        msg += `\n\n${ATOMIC_EMOJIS.nsfw} 𝗡𝗦𝗙𝗪 𝗧𝗮𝗴𝘀:\n${nsfwTags.join(", ")}`;
      } else {
        msg += `\n\n${ATOMIC_EMOJIS.nsfw} 𝗡𝗦𝗙𝗪 𝗧𝗮𝗴𝘀: 𝗟𝗼𝗰𝗸𝗲𝗱 🔒\nUse /requestNSFW for access`;
      }
      
      return message.reply(atomicMessage(msg));
    }

    // ❌ Invalid tag
    if (!allTags.includes(tag)) {
      let msg = `❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝘁𝗮𝗴: '${tag}'\n\n`;
      msg += `${ATOMIC_EMOJIS.tags} 𝗩𝗮𝗹𝗶𝗱 𝗧𝗮𝗴𝘀:\n`;
      msg += `✨ 𝗦𝗙𝗪: ${sfwTags.join(", ")}`;
      
      if (bypassIds.includes(uid) || approvedNSFW.includes(tid)) {
        msg += `\n\n${ATOMIC_EMOJIS.nsfw} 𝗡𝗦𝗙𝗪: ${nsfwTags.join(", ")}`;
      }
      
      return message.reply(atomicMessage(msg));
    }

    // 🔞 NSFW permission check
    const isNSFW = nsfwTags.includes(tag);
    if (isNSFW && !bypassIds.includes(uid) && !approvedNSFW.includes(tid)) {
      const msg = atomicMessage(
        `${ATOMIC_EMOJIS.nsfw} 𝗡𝗦𝗙𝗪 𝗟𝗼𝗰𝗸𝗲𝗱!\n\n` +
        `⚡ Reason: This thread is not NSFW-approved\n` +
        `💡 Use /requestNSFW to request access`
      );
      
      const msgSend = await message.reply(msg);
      setTimeout(() => message.unsend(msgSend.messageID), 30000);
      return;
    }

    try {
      // Set processing reaction
      api.setMessageReaction(ATOMIC_EMOJIS.processing, messageID, () => {}, true);
      
      // Send processing message
      const processingMsg = await message.reply(
        atomicMessage(`${ATOMIC_EMOJIS.processing} Crafting atomic GIF...`)
      );

      const cacheDir = path.join(__dirname, "cache", "atomic_gifs");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `atomic_${tag}_${Date.now()}.gif`);

      // ✅ Reliable API endpoint
      const apiUrl = `https://api.otakugifs.xyz/gif?reaction=${tag}`;
      
      const { data } = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'AtomicAniGIF/3.0',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!data || !data.url) {
        throw new Error("Invalid API response");
      }

      const gifResponse = await axios.get(data.url, {
        responseType: 'arraybuffer',
        onDownloadProgress: progressEvent => {
          const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          if (percent % 25 === 0) {
            api.sendMessage(
              atomicMessage(`${ATOMIC_EMOJIS.gif} Rendering GIF... ${percent}%`),
              threadID
            );
          }
        }
      });

      await fs.writeFile(filePath, Buffer.from(gifResponse.data, "binary"));
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Success message
      const successMsg = atomicMessage(
        `${ATOMIC_EMOJIS.success} Atomic GIF Created!\n\n` +
        `🏷️ Tag: ${tag}\n` +
        `🔒 Type: ${isNSFW ? "NSFW 🔞" : "SFW"}\n` +
        `⏱️ Time: ${timestamp}`
      );

      // Send the final GIF
      await api.sendMessage({
        body: successMsg,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(processingMsg.messageID);
        api.setMessageReaction(ATOMIC_EMOJIS.success, messageID, () => {}, true);
      });

    } catch (error) {
      console.error("Atomic GIF Error:", error);
      
      // Error handling with atomic design
      api.setMessageReaction(ATOMIC_EMOJIS.error, messageID, () => {}, true);
      
      const errorMsg = atomicMessage(
        `❌ Atomic GIF Creation Failed!\n\n` +
        `⚡ Reason: ${error.message || 'API timeout'}\n` +
        `🔧 Tip: Try a different tag or try again later`
      );
      
      api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};
