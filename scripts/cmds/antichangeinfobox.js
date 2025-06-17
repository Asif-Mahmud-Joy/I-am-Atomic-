const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "antichangeinfobox",
    version: "2.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Stop info changes in box",
    longDescription: "Prevent group name, emoji, nickname, theme and avatar from being changed",
    category: "boxchat",
    guide: {
      en: `
        {pn} name on/off - stop name change
        {pn} emoji on/off - stop emoji change
        {pn} theme on/off - stop theme change
        {pn} nickname on/off - stop nickname change
        {pn} avt on/off - stop avatar change
      `
    }
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const [type, status] = args;
    if (!["on", "off"].includes(status))
      return message.reply("🔧 Use 'on' or 'off'. Example: antichangeinfobox name on");

    const threadID = event.threadID;
    const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
    const enable = status === "on";

    const save = async (key, value) => {
      if (!enable) delete data[key];
      else data[key] = value;

      await threadsData.set(threadID, data, "data.antiChangeInfoBox");
      message.reply(`✅ Anti-change for '${key}' ${enable ? "on kora holo" : "off kora holo"}`);
    };

    switch (type) {
      case "name": {
        const { threadName } = await threadsData.get(threadID);
        return save("name", threadName);
      }
      case "emoji": {
        const { emoji } = await threadsData.get(threadID);
        return save("emoji", emoji);
      }
      case "theme": {
        const { threadThemeID } = await threadsData.get(threadID);
        return save("theme", threadThemeID);
      }
      case "nickname": {
        const { members } = await threadsData.get(threadID);
        const nickData = {};
        members.forEach(m => nickData[m.userID] = m.nickname);
        return save("nickname", nickData);
      }
      case "avt":
      case "avatar": {
        const { imageSrc } = await threadsData.get(threadID);
        if (!imageSrc)
          return message.reply("⚠️ Ei group e kono avatar set kora nai.");
        const uploaded = await uploadImgbb(imageSrc);
        return save("avatar", uploaded?.image?.url || imageSrc);
      }
      default:
        return message.reply("❌ Wrong option. Use: name, emoji, theme, nickname, avt");
    }
  },

  onEvent: async function ({ message, event, threadsData, api }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
    if (!data || author === botID) return;

    const rollback = async (type, action, msg) => {
      if (!data[type]) return;
      message.reply(msg);
      await action();
    };

    switch (logMessageType) {
      case "log:thread-name":
        return rollback("name", () => api.setTitle(data.name, threadID), "❗ Group name change blocked!");
      case "log:thread-icon":
        return rollback("emoji", () => api.changeThreadEmoji(data.emoji, threadID), "❗ Emoji change blocked!");
      case "log:thread-color":
        return rollback("theme", () => api.changeThreadColor(data.theme || "196241301102133", threadID), "❗ Theme change blocked!");
      case "log:user-nickname":
        const userNick = data.nickname?.[logMessageData.participant_id];
        if (!userNick) return;
        return rollback("nickname", () => api.changeNickname(userNick, threadID, logMessageData.participant_id), "❗ Nickname change blocked!");
      case "log:thread-image":
        if (!data.avatar) return;
        const stream = await getStreamFromURL(data.avatar);
        return rollback("avatar", () => api.changeGroupImage(stream, threadID), "❗ Avatar change blocked!");
    }
  }
};
