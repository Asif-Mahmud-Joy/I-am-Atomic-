const { getStreamsFromAttachment, getTime } = global.utils;

module.exports = {
  config: {
    name: "sendnoti",
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 3,
    role: 1, // Changed to require admin privileges
    description: {
      en: "Advanced group notification management system",
      vi: "Hệ thống quản lý thông báo nhóm nâng cao",
      bn: "গ্রুপ নোটিফিকেশন ব্যবস্থাপনা সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Available Commands:
• {pn} create <name> - Create new notification group
• {pn} add <name> - Add current group
• {pn} list - View your groups
• {pn} info <name> - Group details
• {pn} delete <name> - Remove current group
• {pn} send <name> | <message> - Send notification
• {pn} remove <name> - Delete group entirely`,
      bn: `📌 ব্যবহারযোগ্য কমান্ড:
• {pn} create <name> - নতুন নোটিফিকেশন গ্রুপ তৈরি করুন
• {pn} add <name> - বর্তমান গ্রুপ যোগ করুন
• {pn} list - আপনার গ্রুপগুলো দেখুন
• {pn} info <name> - গ্রুপের বিস্তারিত
• {pn} delete <name> - বর্তমান গ্রুপ সরান
• {pn} send <name> | <message> - নোটিফিকেশন পাঠান
• {pn} remove <name> - সম্পূর্ণ গ্রুপ ডিলিট করুন`
    }
  },

  langs: {
    en: {
      missingName: "⚠️ Please specify a group name",
      nameExists: "❌ Group '%1' already exists",
      created: "✅ Created group '%1' (ID: %2)",
      added: "➕ Added current group to '%1'",
      noGroups: "ℹ️ You don't manage any groups yet",
      groupList: "📋 Your Notification Groups:\n%1",
      deleted: "➖ Removed current group from '%1'",
      removed: "🗑️ Deleted group '%1' completely",
      sending: "📤 Sending to %1 groups...",
      success: "✅ Sent to %1/%2 groups in '%3'",
      failed: "❌ Failed for %1 groups:\n%2",
      noPermission: "⛔ You must be admin in target groups",
      groupInfo: "📊 Group Info:\nName: %1\nID: %2\nCreated: %3\n\n%4",
      groupMembers: "👥 Included Groups (%1):\n%2",
      emptyGroup: "⚠️ Group '%1' is empty",
      invalidCommand: "❌ Invalid command. Use '{pn} help' for guidance",
      confirmRemove: "⚠️ Are you sure you want to delete group '%1'? React with any emoji to confirm.",
      help: `📚 Command Help:
• {pn} create <name> - Create new notification group
• {pn} add <name> - Add current group
• {pn} list - View your groups
• {pn} info <name> - Group details
• {pn} delete <name> - Remove current group
• {pn} send <name> | <message> - Send notification
• {pn} remove <name> - Delete group entirely`
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    usersData, 
    threadsData, 
    api, 
    getLang,
    prefix
  }) {
    try {
      const { threadID, senderID } = event;
      const action = args[0]?.toLowerCase();
      const lang = getLang;
      
      // Get or initialize user's notification groups
      const userGroups = await usersData.get(senderID, 'data.groupsSendNoti', []);
      
      // Helper functions
      const findGroup = (name) => userGroups.find(g => g.groupName.toLowerCase() === name.toLowerCase());
      const validateAdmin = async (tid) => {
        const threadData = await threadsData.get(tid);
        return threadData.adminIDs.includes(senderID);
      };

      // Show help if no action specified
      if (!action || action === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      // Create new group
      if (action === "create") {
        const groupName = args.slice(1).join(" ");
        if (!groupName) return message.reply(lang("missingName"));
        if (findGroup(groupName)) return message.reply(lang("nameExists", groupName));
        
        const newGroup = {
          groupName,
          groupID: Date.now(),
          threadIDs: [],
          creator: senderID,
          createdAt: new Date().toISOString()
        };
        
        userGroups.push(newGroup);
        await usersData.set(senderID, userGroups, 'data.groupsSendNoti');
        return message.reply(lang("created", groupName, newGroup.groupID));
      }

      // Add current group
      if (action === "add") {
        const groupName = args.slice(1).join(" ");
        if (!groupName) return message.reply(lang("missingName"));
        
        const group = findGroup(groupName);
        if (!group) return message.reply(lang("nameExists", groupName));
        
        const isAdmin = await validateAdmin(threadID);
        if (!isAdmin) return message.reply(lang("noPermission"));
        
        if (!group.threadIDs.includes(threadID)) {
          group.threadIDs.push(threadID);
          await usersData.set(senderID, userGroups, 'data.groupsSendNoti');
        }
        return message.reply(lang("added", groupName));
      }

      // List groups
      if (action === "list") {
        if (userGroups.length === 0) return message.reply(lang("noGroups"));
        
        const list = userGroups.map(g => 
          `• ${g.groupName} (${g.threadIDs.length} groups)`
        ).join("\n");
        
        return message.reply(lang("groupList", list));
      }

      // Group info
      if (action === "info") {
        const groupName = args.slice(1).join(" ");
        if (!groupName) return message.reply(lang("missingName"));
        
        const group = findGroup(groupName);
        if (!group) return message.reply(lang("nameExists", groupName));
        
        const allThreads = await threadsData.getAll();
        const groupThreads = group.threadIDs.map(tid => {
          const thread = allThreads.find(t => t.threadID === tid);
          return `• ${thread?.threadName || 'Unknown'} (${tid})`;
        }).join("\n");
        
        const infoText = group.threadIDs.length > 0 
          ? lang("groupMembers", group.threadIDs.length, groupThreads)
          : lang("emptyGroup", groupName);
          
        return message.reply(lang("groupInfo", 
          group.groupName, 
          group.groupID, 
          getTime(group.groupID, 'DD/MM/YYYY HH:mm:ss'), 
          infoText
        ));
      }

      // Delete current group from list
      if (action === "delete") {
        const groupName = args.slice(1).join(" ");
        if (!groupName) return message.reply(lang("missingName"));
        
        const group = findGroup(groupName);
        if (!group) return message.reply(lang("nameExists", groupName));
        
        const index = group.threadIDs.indexOf(threadID);
        if (index === -1) return message.reply(lang("emptyGroup", groupName));
        
        group.threadIDs.splice(index, 1);
        await usersData.set(senderID, userGroups, 'data.groupsSendNoti');
        return message.reply(lang("deleted", groupName));
      }

      // Remove entire group
      if (action === "remove") {
        const groupName = args.slice(1).join(" ");
        if (!groupName) return message.reply(lang("missingName"));
        
        const group = findGroup(groupName);
        if (!group) return message.reply(lang("nameExists", groupName));
        
        if (group.creator !== senderID) {
          return message.reply(lang("noPermission"));
        }
        
        return message.reply(lang("confirmRemove", groupName), (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            groupName: group.groupName,
            threadID
          });
        });
      }

      // Send notification
      if (action === "send") {
        const [groupName, ...messageParts] = args.slice(1).join(" ").split("|");
        const msgContent = messageParts.join("|").trim();
        
        if (!groupName) return message.reply(lang("missingName"));
        
        const group = findGroup(groupName.trim());
        if (!group) return message.reply(lang("nameExists", groupName));
        if (group.threadIDs.length === 0) return message.reply(lang("emptyGroup", groupName));
        
        const form = { body: msgContent || "Notification from admin" };
        const attachments = [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(a => ["photo", "video", "audio"].includes(a.type));
        
        if (attachments.length > 0) {
          form.attachment = await getStreamsFromAttachment(attachments);
        }
        
        const sendingMsg = await message.reply(lang("sending", group.threadIDs.length));
        
        let successCount = 0;
        const failedGroups = [];
        
        // Process groups in batches to avoid rate limiting
        for (let i = 0; i < group.threadIDs.length; i++) {
          const tid = group.threadIDs[i];
          
          try {
            const isAdmin = await validateAdmin(tid);
            if (!isAdmin) {
              failedGroups.push({ tid, error: "Not admin" });
              continue;
            }
            
            await api.sendMessage(form, tid);
            successCount++;
            
            // Add delay between sends
            if (i < group.threadIDs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            failedGroups.push({ tid, error: error.message });
          }
        }
        
        await api.unsendMessage(sendingMsg.messageID);
        
        let resultMessage = lang("success", successCount, group.threadIDs.length, group.groupName);
        
        if (failedGroups.length > 0) {
          resultMessage += "\n\n" + lang("failed", failedGroups.length,
            failedGroups.map(f => `• ${f.tid}: ${f.error}`).join("\n")
          );
        }
        
        return message.reply(resultMessage);
      }

      // Invalid command
      return message.reply(lang("invalidCommand").replace(/{pn}/g, prefix + this.config.name));
    } catch (error) {
      console.error("Error in sendnoti command:", error);
      return message.reply("❌ An error occurred. Please try again later.");
    }
  },

  onReaction: async function ({ 
    message, 
    Reaction, 
    event, 
    usersData, 
    getLang 
  }) {
    try {
      if (event.userID !== Reaction.author) return;
      
      const { groupName } = Reaction;
      const userGroups = await usersData.get(Reaction.author, 'data.groupsSendNoti', []);
      
      const index = userGroups.findIndex(g => g.groupName === groupName);
      if (index !== -1) {
        userGroups.splice(index, 1);
        await usersData.set(Reaction.author, userGroups, 'data.groupsSendNoti');
        return message.reply(getLang("removed", groupName));
      }
    } catch (error) {
      console.error("Error in reaction handler:", error);
    }
  }
};
