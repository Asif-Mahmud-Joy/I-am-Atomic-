module.exports = {
  config: {
    name: "all",
    version: "4.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 1,
    description: "Tag all members with atomic design style",
    category: "group",
    guide: {
      en: "{pn} [message]"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // ⚛️ Start atomic typing animation
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
      
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];
      
      if (participantIDs.length === 0) {
        return message.reply(getErrorMessage("⚠️ No members to tag!"));
      }
      
      // ⚛️ Atomic design header
      const header = `╔═══════════════════════╗
║   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗔𝗚𝗚𝗘𝗥 ⚛️   ║
╚═══════════════════════╝`;
      
      // ✨ Prepare message content
      const content = args.join(" ") || "𝗘𝘃𝗲𝗿𝘆𝗼𝗻𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲!";
      
      // 🔷 Create mentions with atomic style
      const mentions = [];
      let body = `${header}\n\n${content}\n\n┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃   🔷 𝗧𝗔𝗚𝗚𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 🔷   ┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n`;
      
      for (const uid of participantIDs) {
        mentions.push({
          tag: "▫️",
          id: uid,
          fromIndex: body.length
        });
        body += "▸ ▫️\n"; // Atomic bullet points
      }
      
      // ⚡ Add atomic statistics footer
      const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      body += `\n⚡ 𝗧𝗼𝘁𝗮𝗹 𝗺𝗲𝗺𝗯𝗲𝗿𝘀: ${participantIDs.length}`;
      body += `\n⏳ ${time}`;
      body += `\n\n❖━━━━━━━━━━━━━━━━━━━━━━━━━━━❖`;
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ✨ Send the atomic-designed message
      message.reply({
        body,
        mentions,
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/fj3BPoJ.png")
      });
      
    } catch (err) {
      message.reply(getErrorMessage(`❌ Error: ${err.message}`));
    }
  }
};

// ⚛️ Atomic design helper functions
function getErrorMessage(text) {
  return `┏━━━━━━━━━━━━━━━━━━━┓
┃   ⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗘𝗥𝗥𝗢𝗥 ⚠️   ┃
┗━━━━━━━━━━━━━━━━━━━┛
${text}
─────────────────────
⚛️ Please try again later`;
}

function getSuccessMessage(text) {
  return `┏━━━━━━━━━━━━━━━━━━━┓
┃   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 ⚛️   ┃
┗━━━━━━━━━━━━━━━━━━━┛
${text}
─────────────────────
✨ Command executed atomically`;
}
