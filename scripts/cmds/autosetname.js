function checkShortCut(nickname, uid, userName) {
  return nickname
    .replace(/{userName}/gi, userName)
    .replace(/{userID}/gi, uid);
}

module.exports = {
  config: {
    name: "autosetname",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    cooldowns: 5,
    role: 1,
    description: {
      vi: "Tự đổi biệt danh cho thành viên mới vào nhóm chat",
      en: "Auto change nickname of new member"
    },
    category: "box chat",
    guide: {
      vi: `   {pn} set <nickname>: đặt cấu hình biệt danh tự động.
   Shortcut:
   + {userName}: tên thành viên
   + {userID}: ID thành viên
   Ví dụ: {pn} set {userName} 🚀

   {pn} on/off: bật/tắt tính năng
   {pn} view/info: xem cấu hình hiện tại`,
      en: `   {pn} set <nickname>: set nickname config.
   Shortcut:
   + {userName}: member name
   + {userID}: member ID
   Example: {pn} set {userName} 🚀

   {pn} on/off: turn on/off
   {pn} view/info: see current config`
    }
  },

  langs: {
    vi: {
      missingConfig: "⚠️ Vui lòng nhập cấu hình cần thiết!",
      configSuccess: "✅ Đã lưu cấu hình thành công!",
      currentConfig: "📌 Cấu hình hiện tại:
%1",
      notSetConfig: "⚠️ Chưa có cấu hình nào được đặt!",
      syntaxError: "❌ Cú pháp sai! Chỉ dùng: {pn} on / off",
      turnOnSuccess: "✅ Đã bật autoSetName!",
      turnOffSuccess: "✅ Đã tắt autoSetName!",
      error: "❌ Đổi biệt danh thất bại. Tắt 'liên kết mời' trong nhóm rồi thử lại."
    },
    en: {
      missingConfig: "⚠️ Please enter the required configuration!",
      configSuccess: "✅ Configuration saved successfully!",
      currentConfig: "📌 Current configuration:
%1",
      notSetConfig: "⚠️ No configuration set yet!",
      syntaxError: "❌ Syntax error! Use: {pn} on / off",
      turnOnSuccess: "✅ autoSetName is now ON!",
      turnOffSuccess: "✅ autoSetName is now OFF!",
      error: "❌ Failed to set nickname. Disable invite link feature and try again."
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    const command = args[0]?.toLowerCase();
    const value = args.slice(1).join(" ");

    if (["set", "add", "config"].includes(command)) {
      if (!value)
        return message.reply(getLang("missingConfig"));
      await threadsData.set(event.threadID, value, "data.autoSetName");
      return message.reply(getLang("configSuccess"));
    }

    if (["view", "info"].includes(command)) {
      const config = await threadsData.get(event.threadID, "data.autoSetName");
      return message.reply(config ? getLang("currentConfig", config) : getLang("notSetConfig"));
    }

    if (["on", "off"].includes(command)) {
      await threadsData.set(event.threadID, command === "on", "settings.enableAutoSetName");
      return message.reply(command === "on" ? getLang("turnOnSuccess") : getLang("turnOffSuccess"));
    }

    return message.reply(getLang("syntaxError"));
  },

  onEvent: async function ({ message, event, api, threadsData, getLang }) {
    if (event.logMessageType !== "log:subscribe") return;

    const isEnabled = await threadsData.get(event.threadID, "settings.enableAutoSetName");
    if (!isEnabled) return;

    const config = await threadsData.get(event.threadID, "data.autoSetName");
    if (!config) return;

    const newMembers = event.logMessageData.addedParticipants || [];

    for (const member of newMembers) {
      const { userFbId: uid, fullName: name } = member;
      const nick = checkShortCut(config, uid, name);
      try {
        await api.changeNickname(nick, event.threadID, uid);
      } catch (err) {
        message.reply(getLang("error"));
      }
    }
  }
};
