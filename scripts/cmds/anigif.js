const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "anigif",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    role: 0,
    category: "Fun",
    shortDescription: "Anime GIFs with SFW & NSFW tag system",
    longDescription: "Bot will send you anime gif based on provided tag. SFW/NSFW with permission system.",
    guide: {
      en: "{pn} <tag> | Type only {pn} to see tag list"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    // 🔐 Permission Checking System
    const approvedMain = fs.readJSONSync(`${__dirname}/assist_json/approved_main.json`, { throws: false }) || [];
    const approvedNSFW = fs.readJSONSync(`${__dirname}/assist_json/approved_ids.json`, { throws: false }) || [];
    const bypassIds = fs.readJSONSync(`${__dirname}/assist_json/bypass_id.json`, { throws: false }) || [];

    const uid = event.senderID;
    const tid = event.threadID;

    if (!bypassIds.includes(uid) && !approvedMain.includes(tid)) {
      const msgSend = await message.reply(`⚠️ Command 'anigif' is locked.\nReason: This is a main command.\nUse ${p}requestMain to request access.`);
      setTimeout(() => message.unsend(msgSend.messageID), 40000);
      return;
    }

    // ✅ All Tags
    const sfwTags = ["bite", "blush", "comfy", "cry", "cuddle", "dance", "eevee", "fluff", "holo", "hug", "icon", "kiss", "kitsune", "lick", "neko", "okami", "pat", "poke", "senko", "sairo", "slap", "smile", "tail", "tickle"];
    const nsfwTags = ["anal", "blowjob", "cum", "fuck", "pussylick", "solo", "threesome_fff", "threesome_ffm", "threesome_mmf", "yaio", "yuri"];
    const allTags = [...sfwTags, ...nsfwTags];

    const tag = args[0];

    // 📜 Show all tags if none provided
    if (!tag) {
      let msg = "🔖 Available SFW Tags:\n" + sfwTags.join(", ");
      if (bypassIds.includes(uid) || approvedNSFW.includes(tid)) {
        msg += "\n\n🔞 NSFW Tags:\n" + nsfwTags.join(", ");
      } else {
        msg += "\n\n🔞 NSFW Tags: Hidden (Need permission)";
      }
      return message.reply(msg);
    }

    // ❌ Invalid tag
    if (!allTags.includes(tag)) {
      let msg = `❌ Invalid tag: '${tag}'\n\n✅ Valid SFW Tags:\n` + sfwTags.join(", ");
      if (bypassIds.includes(uid) || approvedNSFW.includes(tid)) {
        msg += "\n\n🔞 Valid NSFW Tags:\n" + nsfwTags.join(", ");
      } else {
        msg += "\n\n🔞 NSFW Tags: Hidden (Need permission)";
      }
      return message.reply(msg);
    }

    const isNSFW = nsfwTags.includes(tag);

    if (isNSFW && !bypassIds.includes(uid) && !approvedNSFW.includes(tid)) {
      const msgSend = await message.reply("🔒 This group/thread doesn't have permission to use NSFW tags.\nUse /requestNSFW to send a request.");
      setTimeout(() => message.unsend(msgSend.messageID), 60000);
      return;
    }

    const url = `https://api.otakugifs.xyz/gif?reaction=${tag}`; // ✅ Reliable, free anime gif API

    try {
      const { data } = await axios.get(url);
      if (!data || !data.url) throw new Error("Invalid API response");

      const res = await axios.get(data.url, { responseType: 'arraybuffer' });
      const filePath = `${__dirname}/${tag}_anime.gif`;
      fs.writeFileSync(filePath, res.data);

      await message.reply({
        body: `🎬 Anime GIF (${tag})`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Failed to fetch gif. Try again later.");
    }
  }
};
