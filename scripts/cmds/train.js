const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "train",
    version: "2.0",
    author: "milan-says | upgraded by ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Make a train image with the tagged user",
    longDescription: "Generates a funny Thomas the Train image using the mentioned user's avatar.",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | blank]",
      en: "{pn} [@tag]",
      bn: "{pn} [@tag] - কারো নাম ট্যাগ করো ট্রেন ফান ইমেজ পেতে"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    const uid = Object.keys(event.mentions)[0];

    if (!uid) {
      return message.reply({
        body: "🛤️ Please mention someone to turn them into Thomas the Train!\n🔤 Banglish: Karor naam tag koro, tar train pic banabo!",
      });
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Thomas().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Thomas.png`;
      fs.ensureDirSync(`${__dirname}/tmp`);
      fs.writeFileSync(pathSave, Buffer.from(img));
      return message.reply({
        body: `🚂 Here's the train version of <@${uid}>!`,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } catch (err) {
      console.error("Error generating train image:", err);
      return message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};
