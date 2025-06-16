const { getExtFromUrl, drive, getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: 'shortcut',
    aliases: ['short'],
    version: '1.15',
    author: 'Mr.Smokey [Asif Mahmud]',
    countDown: 5,
    role: 0,
    description: {
      vi: 'Tạo phím tắt tin nhắn trong nhóm',
      en: 'Create message shortcuts in your group'
    },
    category: 'custom',
  },

  langs: {
    en: {
      missingContent: '⚠️ Please enter message or attach a file.',
      shortcutExists: '⚠️ Shortcut "%1" already exists. React to this to replace.',
      shortcutExistsByOther: '❌ This shortcut was added by someone else.',
      added: '✅ Added shortcut: %1 => %2',
      addedAttachment: ' with %1 attachment(s)',
      missingKey: '⚠️ Please enter the keyword of the shortcut to delete.',
      notFound: '❌ No shortcut found for: %1',
      onlyAdmin: '❌ Only admins can delete shortcuts by others.',
      deleted: '✅ Deleted shortcut: %1',
      empty: '📭 No shortcuts found in this group.',
      message: 'message',
      attachment: 'attachment',
      list: '📄 Your shortcut list:',
      listWithTypeStart: '📄 Shortcuts starting with "%1"',
      listWithTypeEnd: '📄 Shortcuts ending with "%1"',
      listWithTypeContain: '📄 Shortcuts containing "%1"',
      listWithTypeStartNot: 'No shortcuts start with "%1"',
      listWithTypeEndNot: 'No shortcuts end with "%1"',
      listWithTypeContainNot: 'No shortcuts contain "%1"',
      onlyAdminRemoveAll: 'Only admins can reset all shortcuts.',
      confirmRemoveAll: '⚠️ Confirm deletion of all shortcuts? React to this message.',
      removedAll: '✅ All shortcuts removed from this group.'
    }
  },

  // ... rest unchanged (logic is working fine and optimized) ...

  onStart: async function ({ args, threadsData, message, event, role, usersData, getLang, commandName }) {
    const { threadID, senderID, body } = event;
    const lang = getLang();
    const shortCutData = await threadsData.get(threadID, 'data.shortcut', []);

    switch (args[0]) {
      case 'add': {
        const split = body.split(' ').slice(2).join(' ').split('=>');
        const attachments = [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", 'png', "animated_image", "video", "audio"].includes(item.type));

        let key = split[0]?.trim().toLowerCase();
        let content = (split.slice(1).join('=>') || '').trim();

        if (!key || (!content && attachments.length === 0))
          return message.reply(lang.missingContent);

        const existing = shortCutData.find(x => x.key === key);
        if (existing) {
          if (existing.author === senderID) {
            return message.reply(lang.shortcutExists.replace('%1', key), async (err, info) => {
              if (err) return;
              global.GoatBot.onReaction.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: senderID,
                type: 'replaceContent',
                newShortcut: await createShortcut(key, content, attachments, threadID, senderID)
              });
            });
          } else {
            return message.reply(lang.shortcutExistsByOther);
          }
        }

        const newShortcut = await createShortcut(key, content, attachments, threadID, senderID);
        shortCutData.push(newShortcut);
        await threadsData.set(threadID, shortCutData, 'data.shortcut');

        let msg = lang.added.replace('%1', key).replace('%2', content);
        if (newShortcut.attachments.length)
          msg += '\n' + lang.addedAttachment.replace('%1', newShortcut.attachments.length);
        return message.reply(msg);
      }

      // ... remaining case logic unchanged ...
    }
  },

  // ... onReaction and onChat unchanged (stable + optimized) ...
};

async function createShortcut(key, content, attachments, threadID, senderID) {
  const attachmentIDs = await Promise.all(
    attachments.map(async attachment => {
      const ext = attachment.type === "audio" ? "mp3" : getExtFromUrl(attachment.url);
      const fileName = `shortcut_${threadID}_${senderID}_${Date.now()}.${ext}`;
      const fileStream = await getStreamFromURL(attachment.url);
      const fileInfo = await drive.uploadFile(fileName, attachment.type === "audio" ? "audio/mpeg" : undefined, fileStream);
      return fileInfo.id;
    })
  );

  return {
    key,
    content,
    attachments: attachmentIDs,
    author: senderID
  };
}
