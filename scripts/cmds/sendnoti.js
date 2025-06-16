// GoatBot sendnoti Command - Fully Upgraded Version with Banglish Support & Valid API Integration
// Author: Upgraded by Mr.Smokey [Asif Mahmud]

const { getStreamsFromAttachment, getTime } = global.utils;

module.exports = {
  config: {
    name: "sendnoti",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Gửi thông báo nhóm",
      en: "Send group notification",
      bn: "Group noti pathanor jonne"
    },
    longDescription: {
      vi: "Gửi thông báo đến các nhóm quản lý",
      en: "Send notifications to managed groups",
      bn: "Noti pathao tumi je group gulo manage koro tader kache"
    },
    category: "box chat",
    guide: {
      en: `Use the following:
- create <name>
- add <name>
- list
- info <name>
- delete <name>
- send <name> | <message>
- remove <name>`
    }
  },

  langs: {
    bn: {
      missingGroupName: "Group noti er name dao.",
      groupNameExists: "Group '%1' agei create kora hoyeche, onno nam dao.",
      createdGroup: "Group noti toiri hoyeche:\n- Name: %1\n- ID: %2",
      missingGroupNameToAdd: "Je group noti te add korte chao tar nam dao.",
      groupNameNotExists: "Group '%1' tumi create/maintain koro na.",
      notAdmin: "Tumi ei group er admin na.",
      added: "Ei group add hoyeche noti group '%1' e.",
      missingGroupNameToDelete: "Je group noti theke remove korte chao tar nam dao.",
      notInGroup: "Ei group '%1' e nai.",
      emptyList: "Tumi kono noti group manage korcho na.",
      showList: "Tumar managed group noti list:\n%1",
      deleted: "Group noti '%1' theke ei group remove kora holo.",
      failed: "%1 group e noti pathate parini:\n%2",
      missingGroupNameToRemove: "Je group noti ke pura remove korte chao tar nam dao.",
      removed: "Group noti '%1' remove kora hoyeche.",
      missingGroupNameToSend: "Je group noti te message pathate chao tar nam dao.",
      groupIsEmpty: "Group '%1' e kono group nai.",
      sending: "Noti pathacchi %1 group e...",
      success: "%1 group e noti successfully pathano holo (group: '%2')",
      notAdminOfGroup: "Tumi ei group er admin na.",
      missingGroupNameToView: "Je group noti info dekhte chao tar nam dao.",
      groupInfo: "Group Name: %1\nID: %2\nCreate Time: %3\n%4",
      groupInfoHasGroup: "Group e ache:\n%1",
      noGroup: "Tumi kono noti group banai nai."
    }
  },

  onStart: async function ({ message, event, args, usersData, threadsData, api, getLang, role }) {
    const lang = getLang('bn');
    const { threadID, senderID } = event;
    const groups = await usersData.get(senderID, 'data.groupsSendNoti', []);

    const input = args[0];
    const name = args.slice(1).join(" ").split('|')[0].trim();
    const msgText = args.join(" ").split('|')[1]?.trim();

    const findGroup = (groupName) => groups.find(g => g.groupName === groupName);

    switch (input) {
      case "create": {
        if (!name) return message.reply(lang.missingGroupName);
        if (findGroup(name)) return message.reply(lang.groupNameExists.replace('%1', name));
        const newGroup = { groupName: name, groupID: Date.now(), threadIDs: [] };
        groups.push(newGroup);
        await usersData.set(senderID, groups, 'data.groupsSendNoti');
        return message.reply(lang.createdGroup.replace('%1', name).replace('%2', newGroup.groupID));
      }

      case "add": {
        if (!name) return message.reply(lang.missingGroupNameToAdd);
        const group = findGroup(name);
        if (!group) return message.reply(lang.groupNameNotExists.replace('%1', name));
        if (role < 1) return message.reply(lang.notAdmin);
        if (!group.threadIDs.includes(threadID)) group.threadIDs.push(threadID);
        await usersData.set(senderID, groups, 'data.groupsSendNoti');
        return message.reply(lang.added.replace('%1', name));
      }

      case "list": {
        if (!groups.length) return message.reply(lang.emptyList);
        const list = groups.map(g => `+ ${g.groupName} - ${g.threadIDs.length}`).join("\n");
        return message.reply(lang.showList.replace('%1', list));
      }

      case "delete": {
        if (!name) return message.reply(lang.missingGroupNameToDelete);
        const group = findGroup(name);
        if (!group) return message.reply(lang.groupNameNotExists.replace('%1', name));
        const index = group.threadIDs.indexOf(threadID);
        if (index === -1) return message.reply(lang.notInGroup.replace('%1', name));
        group.threadIDs.splice(index, 1);
        await usersData.set(senderID, groups, 'data.groupsSendNoti');
        return message.reply(lang.deleted.replace('%1', name));
      }

      case "remove": {
        if (!name) return message.reply(lang.missingGroupNameToRemove);
        const index = groups.findIndex(g => g.groupName === name);
        if (index === -1) return message.reply(lang.groupNameNotExists.replace('%1', name));
        groups.splice(index, 1);
        await usersData.set(senderID, groups, 'data.groupsSendNoti');
        return message.reply(lang.removed.replace('%1', name));
      }

      case "send": {
        if (!name) return message.reply(lang.missingGroupNameToSend);
        const group = findGroup(name);
        if (!group) return message.reply(lang.groupNameNotExists.replace('%1', name));
        if (group.threadIDs.length === 0) return message.reply(lang.groupIsEmpty.replace('%1', name));
        const form = { body: msgText || "" };
        const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])];
        if (attachments.length) {
          form.attachment = await getStreamsFromAttachment(attachments);
        }

        const msgWait = await message.reply(lang.sending.replace('%1', group.threadIDs.length));
        let success = 0, failMsg = "";

        for (const tid of group.threadIDs) {
          try {
            const { adminIDs, threadName } = await threadsData.get(tid);
            if (!adminIDs.includes(senderID)) throw new Error(lang.notAdminOfGroup);
            await new Promise((resolve, reject) => api.sendMessage(form, tid, err => err ? reject(err) : resolve()));
            success++;
          } catch (err) {
            failMsg += `\n- ID: ${tid}\n- Error: ${err.message}`;
          }
        }

        api.unsendMessage(msgWait.messageID);
        return message.reply((success ? lang.success.replace('%1', success).replace('%2', name) + '\n' : '') + (failMsg ? lang.failed.replace('%1', group.threadIDs.length - success).replace('%2', failMsg) : ''));
      }

      case "info": {
        if (!name) return message.reply(lang.missingGroupNameToView);
        const group = findGroup(name);
        if (!group) return message.reply(lang.groupNameNotExists.replace('%1', name));
        const all = await threadsData.getAll();
        const details = group.threadIDs.map(tid => {
          const data = all.find(x => x.threadID == tid);
          return `+ ID: ${tid}\n+ Name: ${data?.threadName || 'Unknown'}`;
        }).join("\n\n");

        return message.reply(lang.groupInfo
          .replace('%1', group.groupName)
          .replace('%2', group.groupID)
          .replace('%3', getTime(group.groupID, 'DD/MM/YYYY HH:mm:ss'))
          .replace('%4', details ? lang.groupInfoHasGroup.replace('%1', details) : lang.groupIsEmpty.replace('%1', name)));
      }

      default: return message.SyntaxError();
    }
  }
};
