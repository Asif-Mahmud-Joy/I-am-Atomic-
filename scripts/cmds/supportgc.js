module.exports = {
  config: {
    name: "supportgc",
    version: "2.0",
    author: "Shikaki (Updated by ChatGPT)",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Join the support group chat"
    },
    longDescription: {
      en: "Join the official support group chat"
    },
    category: "General",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "27455554110724563"; // Replace with your support group thread ID

    try {
      const threadData = await threadsData.get(supportGroupThreadID);
      const members = threadData.members || [];

      const userAlreadyInGroup = members.some(
        member => member.userID === event.senderID
      );

      if (userAlreadyInGroup) {
        return message.reply(`🚫 আপনি ইতিমধ্যেই SupportGc গ্রুপের সদস্য 🚫\n------------------------`);
      }

      await api.addUserToGroup(event.senderID, supportGroupThreadID);

      return message.reply(`🎉 আপনাকে সফলভাবে SupportGc তে যুক্ত করা হয়েছে 🎉\n------------------------`);
    } catch (error) {
      console.error("Error adding user to support group:", error);
      return message.reply(
        `❌ আপনাকে SupportGc তে এড করতে ব্যর্থ হয়েছি 😞।\n✅ আপনি আমায় Friend Request পাঠান অথবা\n🔓 আপনার প্রোফাইল Unlock করুন এবং আবার চেষ্টা করুন ❌\n------------------------`
      );
    }
  }
};
