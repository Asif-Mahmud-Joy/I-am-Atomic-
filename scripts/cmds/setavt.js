const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "setavt",
    aliases: ["changeavt", "setavatar", "avt"],
    version: "2.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 5,
    role: 2, // Bot owner only
    description: {
      en: "Change bot's profile picture with advanced options",
      vi: "Thay đổi ảnh đại diện bot với các tùy chọn nâng cao",
      bn: "বটের প্রোফাইল ছবি পরিবর্তন করুন উন্নত বিকল্প সহ"
    },
    category: "owner",
    guide: {
      en: `📌 How to use:
• {pn} [image URL] - Change avatar permanently
• {pn} [image URL] [caption] - Change with caption
• {pn} [image URL] [caption] [duration] - Temporary avatar (in seconds)
• Reply to an image with {pn} - Use replied image
• Attach image with {pn} - Use attached image`,
      bn: `📌 ব্যবহার বিধি:
• {pn} [ছবির URL] - স্থায়ীভাবে অ্যাভাটার পরিবর্তন করুন
• {pn} [ছবির URL] [ক্যাপশন] - ক্যাপশন সহ পরিবর্তন করুন
• {pn} [ছবির URL] [ক্যাপশন] [সময়] - অস্থায়ী অ্যাভাটার (সেকেন্ডে)
• ছবিতে রিপ্লাই দিয়ে {pn} - রিপ্লাই করা ছবি ব্যবহার করুন
• ছবি সংযুক্ত করে {pn} - সংযুক্ত ছবি ব্যবহার করুন`
    }
  },

  langs: {
    en: {
      missingImage: "⚠️ Please provide an image URL or attach/reply to an image",
      fetchingError: "❌ Failed to fetch image. Please check the URL",
      invalidImage: "❌ Invalid image format. Supported formats: JPG, PNG, GIF",
      success: "✅ Successfully updated bot's profile picture",
      tempSuccess: "⏳ Successfully set temporary avatar for %1 seconds",
      error: "❌ An error occurred while changing avatar: %1"
    },
    bn: {
      missingImage: "⚠️ একটি ছবির URL দিন বা ছবি সংযুক্ত/রিপ্লাই করুন",
      fetchingError: "❌ ছবি ডাউনলোড করতে ব্যর্থ। URL পরীক্ষা করুন",
      invalidImage: "❌ অবৈধ ছবি ফরম্যাট। সমর্থিত ফরম্যাট: JPG, PNG, GIF",
      success: "✅ বটের প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে",
      tempSuccess: "⏳ সফলভাবে অস্থায়ী অ্যাভাটার সেট করা হয়েছে %1 সেকেন্ডের জন্য",
      error: "❌ অ্যাভাটার পরিবর্তন করতে সমস্যা হয়েছে: %1"
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    api, 
    getLang 
  }) {
    try {
      // Determine image source
      let imageURL = args[0]?.startsWith("http") ? args.shift() : 
                    event.attachments?.[0]?.url || 
                    event.messageReply?.attachments?.[0]?.url;

      if (!imageURL) {
        return message.reply(getLang("missingImage"));
      }

      // Parse optional parameters
      let duration = null;
      let caption = "";
      
      // Check if last argument is a number (duration)
      if (!isNaN(args[args.length - 1])) {
        duration = parseInt(args.pop()) * 1000; // Convert to milliseconds
      }
      
      caption = args.join(" ");

      // Download and validate image
      const response = await axios.get(imageURL, {
        responseType: "stream"
      }).catch(err => {
        throw new Error("FETCH_ERROR");
      });

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("INVALID_IMAGE");
      }

      // Prepare image file
      const tempPath = `${__dirname}/tmp/avatar_${Date.now()}.jpg`;
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Change avatar
      await new Promise((resolve, reject) => {
        api.changeAvatar(
          fs.createReadStream(tempPath),
          caption,
          duration,
          (err) => {
            fs.unlinkSync(tempPath); // Clean up temp file
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });

      // Send success message
      if (duration) {
        message.reply(getLang("tempSuccess", duration / 1000));
      } else {
        message.reply(getLang("success"));
      }

    } catch (error) {
      console.error("Avatar change error:", error);
      
      let errorMessage;
      switch (error.message) {
        case "FETCH_ERROR":
          errorMessage = getLang("fetchingError");
          break;
        case "INVALID_IMAGE":
          errorMessage = getLang("invalidImage");
          break;
        default:
          errorMessage = getLang("error", error.message);
      }
      
      message.reply(errorMessage);
    }
  }
};
