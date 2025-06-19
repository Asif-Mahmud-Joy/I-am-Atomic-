module.exports = {
  config: {
    name: "all",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 1,
    description: "Tag all members in your group chat with royal style",
    category: "group",
    guide: {
      en: "{pn} [message]"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // 🎭 Start typing animation
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];
      
      if (participantIDs.length === 0) {
        return message.reply(getErrorMessage("⚠️ Group e kono member nai tag korar jonne."));
      }
      
      // ✨ Create a beautiful header
      const header = `╔═══════════════════╗
║  🎯 𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡 𝗔𝗟𝗟  🎯  ║
╚═══════════════════╝`;
      
      // 💬 Prepare the message content
      const content = args.join(" ") || "𝗘𝘃𝗲𝗿𝘆𝗼𝗻𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲!";
      
      // 👥 Create mentions with visual flair
      const mentions = [];
      let body = `${header}\n\n${content}\n\n┏━━━━━━━━━━━━━━━━━━┓\n┃  👥 𝗧𝗔𝗚𝗚𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦  👥  ┃\n┗━━━━━━━━━━━━━━━━━━┛\n`;
      
      for (const uid of participantIDs) {
        mentions.push({
          tag: "@user",
          id: uid,
          fromIndex: body.length
        });
        body += "▸ @user\n";
      }
      
      // 🔢 Add statistics footer
      body += `\n📊 𝗧𝗼𝘁𝗮𝗹 𝗺𝗲𝗺𝗯𝗲𝗿𝘀: ${participantIDs.length}`;
      body += `\n🕒 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      
      // ✨ Send the final message
      message.reply({
        body,
        mentions,
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/8n6N2rF.png")
      });
      
    } catch (err) {
      message.reply(getErrorMessage(`❌ Somossa hoise tag korar somoy: ${err.message}`));
    }
  }
};

// 🎨 Design helper functions
function getErrorMessage(text) {
  return `┏━━━━━━━━━━━━━━━━━┓
┃    ❌ 𝗘𝗥𝗥𝗢𝗥    ┃
┗━━━━━━━━━━━━━━━━━┛
${text}
───────────────────
⚠️ Please try again later`;
}

function getSuccessMessage(text) {
  return `┏━━━━━━━━━━━━━━━━━┓
┃    ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦    ┃
┗━━━━━━━━━━━━━━━━━┛
${text}
───────────────────
💫 Command executed successfully`;
}
