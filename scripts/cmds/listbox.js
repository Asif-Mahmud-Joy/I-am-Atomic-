module.exports = {
  config: {
    name: "listbox",
    aliases: [],
    author: "Mr.Smokey [Asif Mahmud]",
    version: "2.1",
    cooldowns: 5,
    role: 2,
    shortDescription: {
      en: "List all group chats",
      bn: "সব গ্রুপ চ্যাটের তালিকা দেখান"
    },
    longDescription: {
      en: "List all group chats the bot is currently in.",
      bn: "বট যেসব গ্রুপে আছে, তাদের লিস্ট দেখায়।"
    },
    category: "owner",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      noGroup: "No group chats found.",
      title: "List of group chats:"
    },
    bn: {
      noGroup: "কোনো গ্রুপ চ্যাট খুঁজে পাওয়া যায়নি।",
      title: "গ্রুপ চ্যাটের তালিকা:"
    }
  },

  onStart: async function ({ api, event, getLang }) {
    try {
      const groupList = await api.getThreadList(100, null, ["INBOX"]);
      const filteredList = groupList.filter(
        group => group.isGroup && group.threadName !== null
      );

      if (filteredList.length === 0) {
        return api.sendMessage(getLang("noGroup"), event.threadID);
      }

      const formattedList = filteredList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}`
      );

      const message = `╭─╮\n│${getLang("title")}\n${formattedList.join("\n")}\n╰───────────ꔪ`;
      await api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
      console.error("[ListBox Error]", error);
      return api.sendMessage("❌ গ্রুপ তালিকা লোড করতে সমস্যা হয়েছে। Console চেক করুন।", event.threadID);
    }
  }
};
