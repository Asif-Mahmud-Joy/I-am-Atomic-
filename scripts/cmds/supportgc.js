module.exports = {
  config: {
    name: "supportgc",
    version: "3.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "✨ Join our official support group ✨"
    },
    category: "support",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🎀  SUPPORT GROUP INVITE  🎀
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ Just type: {pn}

💎 Features:
✦ Instant group invitation
✦ Automatic membership check
✦ Friendly guidance if issues occur
      `
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "27455554110724563"; // Replace with your actual support group ID
    
    try {
      // Get thread data and check membership
      const threadInfo = await api.getThreadInfo(supportGroupThreadID);
      const userIsMember = threadInfo.participantIDs.includes(event.senderID);

      if (userIsMember) {
        return message.reply(`
✅ You're already in our support group!
────────────────────
Thank you for being part of our community.
If you need help, feel free to ask in the group.
        `);
      }

      // Try to add user to group
      await api.addUserToGroup(event.senderID, supportGroupThreadID);
      
      return message.reply(`
🎉 Successfully added you to our support group!
────────────────────
Please check your Messenger inbox for the group chat.
If you don't see it, try refreshing your Messenger app.
      `);

    } catch (error) {
      console.error("Support Group Error:", error);
      
      return message.reply(`
⚠️ Couldn't add you to the support group
────────────────────
Possible solutions:
1. Send me a friend request first
2. Make sure your profile isn't locked
3. Check your privacy settings
4. Try again later

If issues persist, contact the bot owner directly.
      `);
    }
  }
};
