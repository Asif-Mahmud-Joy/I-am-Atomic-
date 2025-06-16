const axios = require("axios");
const { getPrefix, getStreamFromURL, uploadImgbb } = global.utils;

async function ai({ message: m, event: e, args: a, usersData: u }) {
  const prefix = await getPrefix(e.threadID);
  const commandNames = [
    `${prefix}${this.config.name}`,
    `${this.config.name}`
    // Add more aliases if needed
  ];

  if (!a[0] || !commandNames.some(b => a[0].toLowerCase().startsWith(b))) return;

  try {
    let prompt = "";
    const userName = await u.getName(e.senderID);
    const userId = e.senderID;

    if (
      e.type === "message_reply" &&
      e.messageReply.attachments &&
      e.messageReply.attachments[0]?.type === "photo"
    ) {
      const uploaded = await uploadImgbb(e.messageReply.attachments[0].url);
      prompt = a.slice(1).join(" ") + ' ' + uploaded.image.url;
    } else {
      prompt = a.slice(1).join(" ");
    }

    const response = await axios.post("https://ultraproapi.onrender.com/ai", {
      prompt,
      apikey: "ULTRAPRO-API-KEY", // Replace with working key or leave blank for public use
      name: userName,
      id: userId
    });

    let result = response.data.result
      .replace(/{name}/g, userName)
      .replace(/{pn}/g, commandNames[0]);

    if (response.data.av) {
      if (Array.isArray(response.data.av)) {
        const attachments = await Promise.all(
          response.data.av.map(url => getStreamFromURL(url))
        );
        m.reply({ body: result, mentions: [{ id: userId, tag: userName }], attachment: attachments });
      } else {
        m.reply({
          body: result,
          mentions: [{ id: userId, tag: userName }],
          attachment: await getStreamFromURL(response.data.av)
        });
      }
    } else {
      m.reply({ body: result, mentions: [{ id: userId, tag: userName }] });
    }
  } catch (error) {
    m.reply("⚠️ Bhai, kichu ekta problem hoise: " + error.message);
  }
}

module.exports = {
  config: {
    name: "ai",
    aliases: [],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    role: 0,
    shortDescription: "AI diye kaj korano",
    guide: "{pn} <query>",
    category: "AI"
  },
  onStart: function () {},
  onChat: ai
};
