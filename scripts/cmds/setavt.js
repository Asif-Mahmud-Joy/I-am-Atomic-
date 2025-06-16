const axios = require("axios");

module.exports = {
  config: {
    name: "setavt",
    aliases: ["changeavt", "setavatar"],
    version: "1.4",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    description: {
      vi: "Đổi avatar bot",
      en: "Change bot avatar"
    },
    category: "owner",
    guide: {
      vi: `   {pn} [<image url> | <phản hồi tin nhắn có ảnh>] [<caption> | để trống] [<expirationAfter (giây)> | để trống]
Phản hồi tin nhắn có ảnh hoặc gửi kèm ảnh với nội dung: {pn}

Ghi chú:
+ caption: nội dung kèm theo ảnh
+ expirationAfter: đặt thời gian hết hạn cho ảnh đại diện (giây)
Ví dụ:
  {pn} https://example.com/image.jpg
  {pn} https://example.com/image.jpg Hello
  {pn} https://example.com/image.jpg Hello 3600`,

      en: `   {pn} [<image url> | <reply to image>] [<caption> | optional] [<expirationAfter (seconds)> | optional]
Reply or attach image with message: {pn}

Notes:
+ caption: message with the image
+ expirationAfter: set temporary avatar duration (in seconds)
Examples:
  {pn} https://example.com/image.jpg
  {pn} https://example.com/image.jpg Hello
  {pn} https://example.com/image.jpg Hello 3600`
    }
  },

  langs: {
    vi: {
      cannotGetImage: "❌ | Lỗi khi tải ảnh từ URL",
      invalidImageFormat: "❌ | Định dạng ảnh không hợp lệ",
      changedAvatar: "✅ | Avatar bot đã được cập nhật"
    },
    en: {
      cannotGetImage: "❌ | Failed to fetch image from URL",
      invalidImageFormat: "❌ | Invalid image format",
      changedAvatar: "✅ | Bot avatar updated successfully"
    },
    bn: {
      cannotGetImage: "❌ | Image URL theke data ana jay nai",
      invalidImageFormat: "❌ | Image format thik nai",
      changedAvatar: "✅ | Bot er avatar successfully update hoye gese"
    }
  },

  onStart: async function ({ message, event, api, args, getLang }) {
    const imageURL = (args[0] || "").startsWith("http") ? args.shift() : event.attachments?.[0]?.url || event.messageReply?.attachments?.[0]?.url;
    const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
    const caption = args.join(" ");

    if (!imageURL)
      return message.SyntaxError();

    try {
      const response = await axios.get(imageURL, {
        responseType: "stream"
      });

      if (!response.headers["content-type"].includes("image"))
        return message.reply(getLang("invalidImageFormat"));

      response.data.path = "avatar.jpg";

      api.changeAvatar(response.data, caption || "", expirationAfter ? expirationAfter * 1000 : null, (err) => {
        if (err)
          return message.err(err);
        return message.reply(getLang("changedAvatar"));
      });
    } catch (err) {
      return message.reply(getLang("cannotGetImage"));
    }
  }
};
