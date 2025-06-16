const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;
const checkUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

module.exports = {
  config: {
    name: "setrankup",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 0,
    role: 0,
    description: {
      vi: "Cấu hình rankup",
      en: "Configure rankup",
      bn: "র‍্যাংকআপ কনফিগার করুন"
    },
    category: "owner",
    guide: {
      vi: `
{pn} text <message>: Cấu hình tin nhắn khi thành viên thăng hạng
Tham số:
+ {userName}, {userNameTag}, {oldRank}, {currentRank}
{pn} file <link>: Đính kèm ảnh hoặc video
{pn} reset: Cấu hình lại mặc định`,
      en: `
{pn} text <message>: Configure message when a member ranks up
Parameters:
+ {userName}, {userNameTag}, {oldRank}, {currentRank}
{pn} file <link>: Attach image or video
{pn} reset: Reset to default`,
      bn: `
{pn} text <message>: মেম্বার র‍্যাংক আপ করলে কি মেসেজ যাবে সেট করুন
প্যারামিটার:
+ {userName}, {userNameTag}, {oldRank}, {currentRank}
{pn} file <link>: ছবি বা ভিডিও অ্যাটাচ করুন
{pn} reset: ডিফল্টে রিসেট করুন`
    }
  },

  langs: {
    vi: {
      changedMessage: "Đã thay đổi tin nhắn rankup thành: %1",
      missingAttachment: "Bạn phải đính kèm ảnh để cấu hình ảnh rankup",
      changedAttachment: "Đã thêm %1 tệp đính kèm vào rankup thành công"
    },
    en: {
      changedMessage: "Changed rankup message to: %1",
      missingAttachment: "You must attach an image to configure the rankup image",
      changedAttachment: "Successfully added %1 attachment(s) to rankup"
    },
    bn: {
      changedMessage: "র‍্যাংকআপ মেসেজ পরিবর্তন হয়েছে: %1",
      missingAttachment: "র‍্যাংকআপের জন্য একটি ছবি বা ভিডিও অ্যাটাচ করতে হবে",
      changedAttachment: "%1টি অ্যাটাচমেন্ট সফলভাবে যোগ করা হয়েছে"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    const { body, threadID, senderID } = event;
    const inputType = args[0];

    if (inputType === "text") {
      const newContent = body.slice(body.indexOf("text") + 5).trim();
      await threadsData.set(threadID, newContent, "data.rankup.message");
      return message.reply(getLang("changedMessage", newContent));
    }

    if (["file", "image", "video", "mp3"].includes(inputType)) {
      const attachments = [...(event.attachments || []), ...(event.messageReply?.attachments || [])].filter(item => ["photo", "animated_image", "video", "audio"].includes(item.type));

      if (!attachments.length && !(args[1] || '').match(checkUrlRegex))
        return message.reply(getLang("missingAttachment"));

      const data = await threadsData.get(threadID, "data", {});
      if (!data.rankup)
        data.rankup = {};
      if (!data.rankup.attachments)
        data.rankup.attachments = [];

      for (const attachment of attachments) {
        const url = attachment.url;
        const ext = getExtFromUrl(url);
        const fileName = `rankup_${threadID}_${senderID}_${getTime()}.${ext}`;
        const fileData = await getStreamFromURL(url);
        const fileInfo = await drive.uploadFile(fileName, fileData);
        data.rankup.attachments.push(fileInfo.id);
      }

      await threadsData.set(threadID, data, "data");
      return message.reply(getLang("changedAttachment", attachments.length));
    }

    if (inputType === "reset") {
      await threadsData.set(threadID, {}, "data.rankup");
      return message.reply("✅ Rankup configuration reset to default.");
    }
  }
};
