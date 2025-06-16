// ✅ FINAL FULLY FIXED + UPGRADED + BANGLISH CUSTOMRANKCARD
const checkUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif)/gi;
const regExColor = /#([0-9a-f]{6})|rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)|rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+\.?\d*)\)/gi;
const { uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "customrankcard",
    aliases: ["crc", "customrank"],
    version: "1.20",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      en: "Design custom rank card with colors or background image"
    },
    category: "rank",
    guide: {
      en: "Use {pn} [option] <value> to customize your rank card.\nOptions: maincolor, subcolor, linecolor, expbarcolor, progresscolor, alphasubcolor, textcolor, namecolor, expcolor, rankcolor, levelcolor, reset.\nExample: {pn} maincolor #fff000 OR {pn} subcolor rgba(255,136,86,0.4) OR {pn} reset"
    }
  },

  langs: {
    en: {
      invalidImage: "❌ Invalid image URL. Use direct .jpg/.png/.gif or upload to https://imgbb.com and use direct link.",
      invalidAttachment: "❌ Attachment must be an image.",
      invalidColor: "❌ Invalid color. Use hex (#xxxxxx), rgb(), or rgba().",
      notSupportImage: "❌ Option '%1' does not support image URLs.",
      success: "✅ Your settings are saved. Preview below:",
      reseted: "✅ All settings reset to default.",
      invalidAlpha: "❌ Please give a value between 0 to 1 for transparency."
    }
  },

  onStart: async function ({ message, threadsData, event, args, getLang, usersData, envCommands }) {
    if (!args[0]) return message.SyntaxError();

    const key = args[0].toLowerCase();
    let value = args.slice(1).join(" ");
    const customRankCard = await threadsData.get(event.threadID, "data.customRankCard", {});

    const supportImage = ["maincolor", "background", "bg", "subcolor", "expbarcolor", "progresscolor", "linecolor"];
    const notSupportImage = ["textcolor", "namecolor", "expcolor", "rankcolor", "levelcolor", "lvcolor"];

    const imageType = ["photo", "animated_image"];
    const attachments = [
      ...(event.messageReply?.attachments || []).filter(a => imageType.includes(a.type)),
      ...event.attachments.filter(a => imageType.includes(a.type))
    ];

    try {
      if ([...supportImage, ...notSupportImage].includes(key)) {
        if (value === "reset") value = "reset";
        else if (value.match(/^https?:\/\//)) {
          const match = value.match(checkUrlRegex);
          if (!match) return message.reply(getLang("invalidImage"));
          value = (await uploadImgbb(match[0], "url")).image.url;
        } else if (attachments.length > 0) {
          const imgUrl = attachments[0].url;
          value = (await uploadImgbb(imgUrl, "url")).image.url;
        } else {
          const matchColors = value.match(regExColor);
          if (!matchColors) return message.reply(getLang("invalidColor"));
          value = matchColors.length === 1 ? matchColors[0] : matchColors;
        }

        if (value !== "reset" && notSupportImage.includes(key) && value.startsWith?.("http"))
          return message.reply(getLang("notSupportImage", key));

        const keyMap = {
          maincolor: "main_color",
          background: "main_color",
          bg: "main_color",
          subcolor: "sub_color",
          linecolor: "line_color",
          expbarcolor: "expNextLevel_color",
          progresscolor: "exp_color",
          textcolor: "text_color",
          namecolor: "name_color",
          expcolor: "exp_text_color",
          rankcolor: "rank_color",
          levelcolor: "level_color",
          lvcolor: "level_color"
        };

        if (value === "reset") delete customRankCard[keyMap[key]];
        else customRankCard[keyMap[key]] = value;

        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
        const stream = await global.client.makeRankCard(
          event.senderID, usersData, threadsData, event.threadID, envCommands["rank"]?.deltaNext || 5
        );
        stream.path = "rankcard.png";

        return message.reply({
          body: getLang("success"),
          attachment: stream
        });
      }

      if (["alphasubcolor", "alphasubcard"].includes(key)) {
        const alpha = parseFloat(value);
        if (alpha < 0 || alpha > 1) return message.reply(getLang("invalidAlpha"));
        customRankCard.alpha_subcard = alpha;
        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
        const stream = await global.client.makeRankCard(
          event.senderID, usersData, threadsData, event.threadID, envCommands["rank"]?.deltaNext || 5
        );
        stream.path = "rankcard.png";
        return message.reply({ body: getLang("success"), attachment: stream });
      }

      if (key === "reset") {
        await threadsData.set(event.threadID, {}, "data.customRankCard");
        return message.reply(getLang("reseted"));
      }

      return message.SyntaxError();
    } catch (err) {
      return message.err(err);
    }
  }
};
