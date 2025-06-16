const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "hug",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a hug gif to one or two mentioned users.",
    },
    longDescription: {
      en: "This command sends a hug gif to one or two mentioned users.",
    },
    category: "Fun",
    guide: {
      en: "To use this command, type /hug followed by one or two user mentions.",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const { getPrefix } = global.utils;
      const p = getPrefix(event.threadID);

      // Approval Check
      const approvedmain = fs.readJsonSync(`${__dirname}/assist_json/approved_main.json`, { throws: false }) || [];
      const bypassmain = fs.readJsonSync(`${__dirname}/assist_json/bypass_id.json`, { throws: false }) || [];

      const bypassmUid = event.senderID;
      const threadmID = event.threadID;

      if (!bypassmain.includes(bypassmUid) && !approvedmain.includes(threadmID)) {
        const msgSend = await message.reply(`cmd 'hug' is locked \uD83D\uDD12...\nReason: Bot's main cmd\nYou need permission to use all main cmds.\n\nType ${p}requestMain to send a request to admin`);
        setTimeout(() => message.unsend(msgSend.messageID), 40000);
        return;
      }

      // UID Handling
      let uid1 = null,
          uid2 = null;
      if (event.mentions && Object.keys(event.mentions).length === 2) {
        uid1 = Object.keys(event.mentions)[0];
        uid2 = Object.keys(event.mentions)[1];
      } else if (event.mentions && Object.keys(event.mentions).length === 1) {
        uid1 = event.senderID;
        uid2 = Object.keys(event.mentions)[0];
      } else {
        return message.reply("Please mention one or two users to send a hug gif.");
      }

      // Special Hug Filter
      if ((uid1 === '61571630409265' || uid2 === '') && (uid1 !== '100010335499038' && uid2 !== '')) {
        uid1 = '61571630409265';
        uid2 = '';
        message.reply("sorry\uD83E\uDD71\uD83D\uDE01\n\nI only hug SiAM \uD83D\uDE0C\uD83D\uDC97");
      }

      // Get user names
      const userInfo = await api.getUserInfo([uid1, uid2]);
      const userName1 = userInfo[uid1]?.name?.split(' ').pop() || "User1";
      const userName2 = userInfo[uid2]?.name?.split(' ').pop() || "User2";

      // Hug GIF API (Updated to working endpoint)
      const response = await axios.get("https://api.waifu.pics/sfw/hug");
      const gifUrl = response.data.url;

      const imgRes = await axios.get(gifUrl, { responseType: "arraybuffer" });
      const path = `${uid1}_${uid2}_hug.gif`;
      fs.writeFileSync(path, Buffer.from(imgRes.data, "binary"));

      await message.reply({
        body: `${userName1} \uD83E\uDD17 ${userName2}`,
        attachment: fs.createReadStream(path),
      });
      fs.unlinkSync(path);

    } catch (err) {
      console.error("[hug command error]", err);
      message.reply("\uD83D\uDE14 Sorry, hug GIF e somossa hoise. Try again later.");
    }
  }
};
