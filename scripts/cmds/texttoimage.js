const fs = require("fs");
const path = require("path");
const axios = global.nodemodule["axios"];

module.exports = {
  config: {
    name: "texttoimage",
    aliases: ["midjourney", "openjourney", "text2image"],
    version: "2.1",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    description: {
      uid: "Tạo ảnh từ văn bản của bạn",
      en: "Create image from your text"
    },
    category: "info",
    guide: {
      vi: "   {pn} <prompt>: tạo ảnh từ văn bản của bạn"
        + "\n    Ví dụ: {pn} a cute cat playing guitar, digital art, 4k",
      en: "   {pn} <prompt>: create image from your text"
        + "\n    Example: {pn} a cute cat playing guitar, digital art, 4k"
    }
  },

  langs: {
    vi: {
      syntaxError: "⚠️ Vui lòng nhập prompt",
      error: "❗ Đã có lỗi xảy ra, vui lòng thử lại sau:\n%1",
      serverError: "❗ Server đang quá tải, vui lòng thử lại sau",
      imageGenFail: "❗ Không thể tạo ảnh. Vui lòng thử lại sau."
    },
    en: {
      syntaxError: "⚠️ Please enter prompt",
      error: "❗ An error has occurred, please try again later:\n%1",
      serverError: "❗ Server is overloaded, please try again later",
      imageGenFail: "❗ Failed to generate image. Please try again later."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply(getLang("syntaxError"));

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://api.popcat.xyz/aiimage?text=${encodedPrompt}`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);
      const imagePath = path.join(__dirname, "texttoimage_output.jpg");
      fs.writeFileSync(imagePath, imageBuffer);

      return message.reply({ attachment: fs.createReadStream(imagePath) });
    } catch (err) {
      console.error("Image generation error:", err?.response?.data || err.message);
      if (err?.response?.status === 503)
        return message.reply(getLang("serverError"));
      return message.reply(getLang("error", err?.response?.data?.error || err.message));
    }
  }
};
