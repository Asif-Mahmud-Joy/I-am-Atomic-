module.exports = {
  config: {
    name: 'kickall',
    version: '2.2.0',
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: 'Remove all group members',
    longDescription: {
      en: 'Kick all members from the group or recover them later with on/off toggle.'
    },
    category: 'Box Chat',
    guide: {
      en: '{p}kickall on/off'
    }
  },

  kickOffMembers: {},

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // Get group info
    let info;
    try {
      info = await api.getThreadInfo(threadID);
    } catch (err) {
      return api.sendMessage("❌ Group info load korte somossa hoise.", threadID);
    }

    const botID = api.getCurrentUserID();
    const allMembers = info.participantIDs.filter(id => id !== botID);

    // Permission check
    const isBotAdmin = info.adminIDs.some(e => e.id === botID);
    const isSenderAdmin = info.adminIDs.some(e => e.id === senderID);

    if (!isBotAdmin)
      return api.sendMessage("❌ Ami ei group-e admin na. Admin korar por abar try koren.", threadID);

    if (!isSenderAdmin)
      return api.sendMessage("❌ Tumi ei command use korte parba na. Only group admin can use it.", threadID);

    // OFF mode: store members
    if (args[0] === 'off') {
      this.kickOffMembers[threadID] = allMembers;
      return api.sendMessage("✅ All members saved. Kickall feature off kora hoise.", threadID);
    }

    // ON mode: re-add stored members
    if (args[0] === 'on') {
      const stored = this.kickOffMembers[threadID] || [];
      let success = 0, fail = 0;

      for (const uid of stored) {
        try {
          await api.addUserToGroup(uid, threadID);
          success++;
        } catch (e) {
          fail++;
        }
      }
      this.kickOffMembers[threadID] = [];
      return api.sendMessage(`✅ Kickall on. Success: ${success}, Fail: ${fail}`, threadID);
    }

    // Default: Kick all
    api.sendMessage("⚠️ Sobai ke remove kora hocche. 5 min por bot auto leave korbe.", threadID);
    setTimeout(() => api.removeUserFromGroup(botID, threadID), 5 * 60 * 1000);

    for (const uid of allMembers) {
      try {
        await new Promise(res => setTimeout(res, 1000));
        await api.removeUserFromGroup(uid, threadID);
      } catch (e) {
        continue;
      }
    }
  }
};
