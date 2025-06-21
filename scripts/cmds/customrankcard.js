const checkUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/gi;
const regExColor = /#([0-9a-f]{6}|[0-9a-f]{3})|rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)|rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+\.?\d*)\)|hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)|hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+\.?\d*)\)/gi;
const { uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "customrankcard",
    aliases: ["crc", "atomicrank"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Design atomic-themed rank cards",
    longDescription: "Create stunning rank cards with atomic design elements, gradients, and custom backgrounds",
    category: "⚡ Atomic",
    guide: {
      en: "{pn} [option] <value>\n\n"
        + "⚛️ Atomic Design Options:\n"
        + "  • maincolor | bg <value>: Main background (image/gradient)\n"
        + "  • subcolor <value>: Sub background\n"
        + "  • linecolor <value>: Divider line color\n"
        + "  • expbarcolor <value>: Experience bar color\n"
        + "  • progresscolor <value>: Progress bar color\n"
        + "  • alphasubcolor <value>: Subcard transparency (0-1)\n"
        + "  • textcolor <value>: Primary text color\n"
        + "  • namecolor <value>: Name text color\n"
        + "  • expcolor <value>: EXP text color\n"
        + "  • rankcolor <value>: Rank text color\n"
        + "  • levelcolor <value>: Level text color\n"
        + "  • reset: Reset to default\n\n"
        + "🌈 Value types:\n"
        + "  • Colors: #hex, rgb(), rgba(), hsl()\n"
        + "  • Gradients: color1 color2 (space separated)\n"
        + "  • Images: Direct image URL\n\n"
        + "💎 Examples:\n"
        + "  • {pn} bg #6A5ACD #48D1CC\n"
        + "  • {pn} namecolor rgba(255,107,107,0.8)\n"
        + "  • {pn} reset"
    }
  },

  langs: {
    en: {
      invalidImage: "❌ Invalid image URL. Use direct image links (jpg/png/gif/webp) or upload to imgbb.com",
      invalidAttachment: "❌ Attachment must be an image file",
      invalidColor: "❌ Invalid color format. Use hex, rgb, rgba, or hsl formats",
      notSupportImage: "❌ Image URLs not supported for '%1' option",
      success: "✅ Atomic Rank Card Updated!\n✨ Preview below:",
      reseted: "🔄 Atomic Design Reset Complete!",
      invalidAlpha: "❌ Transparency must be between 0 and 1",
      processing: "⚙️ Processing your atomic design...",
      designPreview: "🎨 ATOMIC DESIGN PREVIEW",
      optionsChanged: "⚡ Customized Options:",
      noChanges: "🔹 Using default atomic theme"
    }
  },

  onStart: async function ({ message, threadsData, event, args, getLang, usersData, envCommands }) {
    try {
      if (!args[0]) return message.reply("⚡ " + this.config.guide.en);

      const key = args[0].toLowerCase();
      let value = args.slice(1).join(" ");
      const customRankCard = await threadsData.get(event.threadID, "data.customRankCard", {});

      // Show processing status
      await message.reply(getLang("processing"));

      const supportImage = ["maincolor", "background", "bg", "subcolor", "expbarcolor", "progresscolor", "linecolor"];
      const notSupportImage = ["textcolor", "namecolor", "expcolor", "rankcolor", "levelcolor", "lvcolor"];

      const imageType = ["photo", "animated_image"];
      const attachments = [
        ...(event.messageReply?.attachments || []).filter(a => imageType.includes(a.type)),
        ...event.attachments.filter(a => imageType.includes(a.type))
      ];

      if ([...supportImage, ...notSupportImage].includes(key)) {
        if (value.toLowerCase() === "reset") {
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
          delete customRankCard[keyMap[key]];
        }
        else {
          // Handle image URLs
          if (value.match(/^https?:\/\//)) {
            const match = value.match(checkUrlRegex);
            if (!match) return message.reply(getLang("invalidImage"));
            value = (await uploadImgbb(match[0], "url")).image.url;
          } 
          // Handle image attachments
          else if (attachments.length > 0) {
            const imgUrl = attachments[0].url;
            value = (await uploadImgbb(imgUrl, "url")).image.url;
          } 
          // Handle color values
          else {
            const matchColors = value.match(regExColor);
            if (!matchColors) return message.reply(getLang("invalidColor"));
            value = matchColors.length === 1 ? matchColors[0] : matchColors;
          }

          if (notSupportImage.includes(key) && value.startsWith?.("http")) {
            return message.reply(getLang("notSupportImage", key));
          }

          // Map keys to internal properties
          switch (key) {
            case "maincolor":
            case "background":
            case "bg":
              customRankCard.main_color = value;
              break;
            case "subcolor":
              customRankCard.sub_color = value;
              break;
            case "linecolor":
              customRankCard.line_color = value;
              break;
            case "expbarcolor":
              customRankCard.expNextLevel_color = value;
              break;
            case "progresscolor":
              customRankCard.exp_color = value;
              break;
            case "textcolor":
              customRankCard.text_color = value;
              break;
            case "namecolor":
              customRankCard.name_color = value;
              break;
            case "expcolor":
              customRankCard.exp_text_color = value;
              break;
            case "rankcolor":
              customRankCard.rank_color = value;
              break;
            case "levelcolor":
            case "lvcolor":
              customRankCard.level_color = value;
              break;
          }
        }

        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
      }
      else if (["alphasubcolor", "alphasubcard"].includes(key)) {
        const alpha = parseFloat(value);
        if (isNaN(alpha) return message.reply(getLang("invalidAlpha"));
        if (alpha < 0 || alpha > 1) return message.reply(getLang("invalidAlpha"));
        customRankCard.alpha_subcard = alpha;
        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
      }
      else if (key === "reset") {
        await threadsData.set(event.threadID, {}, "data.customRankCard");
        return message.reply(getLang("reseted"));
      }
      else {
        return message.reply("❌ Invalid option. Use 'help' to see available options.");
      }

      // Generate preview
      const stream = await global.client.makeRankCard(
        event.senderID, 
        usersData, 
        threadsData, 
        event.threadID, 
        envCommands.rank?.deltaNext || 5
      );
      stream.path = "atomic_rank_card.png";

      // Create design report
      let designReport = `⚡ ${getLang("designPreview")} ⚡\n`;
      designReport += "╔══════════════════════════╗\n";
      
      if (Object.keys(customRankCard).length > 0) {
        designReport += `║ ${getLang("optionsChanged")}\n`;
        for (const [key, val] of Object.entries(customRankCard)) {
          let displayValue = val;
          if (Array.isArray(val)) displayValue = val.join(" ");
          if (typeof val === "string" && val.startsWith("http")) displayValue = "[Image]";
          if (key === "alpha_subcard") displayValue = `${Math.round(val * 100)}% transparency`;
          
          const optionName = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          designReport += `║ • ${optionName}: ${displayValue}\n`;
        }
      }
      else {
        designReport += `║ ${getLang("noChanges")}\n`;
      }
      
      designReport += "╚══════════════════════════╝";

      return message.reply({
        body: `${getLang("success")}\n\n${designReport}`,
        attachment: stream
      });
    } 
    catch (err) {
      console.error("Atomic Rank Card Error:", err);
      return message.reply("⚠️ Quantum design error! Please try again later.");
    }
  }
};
