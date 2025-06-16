const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    aliases: ["kiss"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Tag kore kiss dp banan",
    longDescription: "Tag kora user er sathe kiss animation banay",
    category: "funny",
    guide: "{pn} @tag",
  },

  onStart: async function ({ api, message, event, usersData }) {
    try {
      const mention = Object.keys(event.mentions);

      if (mention.length === 0)
        return message.reply("❌ | Please tag someone to kiss 💋");

      const one = event.senderID;
      const two = mention[0];

      const avatarURL1 = await usersData.getAvatarUrl(one);
      const avatarURL2 = await usersData.getAvatarUrl(two);

      const img = await new DIG.Kiss().getImage(avatarURL1, avatarURL2);
      const tmpPath = path.join(__dirname, "cache");
      const pathSave = path.join(tmpPath, `${one}_${two}_kiss.png`);

      if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
      fs.writeFileSync(pathSave, Buffer.from(img));

      message.reply(
        {
          body: `😘 | Dekho kiss moment!`,
          attachment: fs.createReadStream(pathSave),
        },
        () => fs.unlinkSync(pathSave)
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ | Kiss image generate korte somossa hoise. Try again!");
    }
  },
};
