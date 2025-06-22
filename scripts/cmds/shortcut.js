const { getExtFromUrl, drive, getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: 'shortcut',
    aliases: ['short'],
    version: '2.0',
    author: 'Asif',
    countDown: 5,
    role: 0,
    description: {
      en: '✨ Create message shortcuts with attachments ✨'
    },
    category: 'custom',
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🎀  SHORTCUT COMMANDS  🎀
╚═══════❖•°♛°•❖═══════╝

⚡ 𝗨𝘀𝗮𝗴𝗲:
❯ ${pn} add <keyword> => <content>
   - Create a new shortcut (can include attachments)
   
❯ ${pn} del <keyword>
   - Delete a shortcut
   
❯ ${pn} list [filter]
   - View all shortcuts (optionally filtered)
   
❯ ${pn} reset
   - Remove all shortcuts (admin only)

💎 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
❯ ${pn} add greet => Hello friends! 👋
❯ ${pn} add rules => (reply with rules image)
❯ ${pn} del greet
❯ ${pn} list start h
      `
    }
  },

  langs: {
    en: {
      missingContent: '📝 Please enter both keyword and content',
      shortcutExists: '⚠️ Shortcut "%1" exists! React to overwrite',
      shortcutExistsByOther: '🚫 "%1" belongs to another user',
      added: '✅ Added shortcut:\n%1 => %2',
      addedAttachment: '\n📎 Attachments: %1',
      missingKey: '🔍 Please specify which shortcut to delete',
      notFound: '❌ No shortcut found for "%1"',
      onlyAdmin: '⛔ Only admins can modify others\' shortcuts',
      deleted: '🗑️ Deleted shortcut: %1',
      empty: '📭 No shortcuts in this group',
      message: '💬 Message',
      attachment: '📎 Attachment',
      list: '📋 Shortcuts List:',
      listWithTypeStart: '🔍 Starting with "%1"',
      listWithTypeEnd: '🔍 Ending with "%1"',
      listWithTypeContain: '🔍 Containing "%1"',
      listWithTypeStartNot: 'No shortcuts start with "%1"',
      listWithTypeEndNot: 'No shortcuts end with "%1"',
      listWithTypeContainNot: 'No shortcuts contain "%1"',
      onlyAdminRemoveAll: '⛔ Only admins can reset all',
      confirmRemoveAll: '⚠️ Delete ALL shortcuts? React to confirm',
      removedAll: '🧹 All shortcuts cleared'
    }
  },

  onStart: async function ({ args, threadsData, message, event, role, usersData, getLang }) {
    try {
      const { threadID, senderID, body } = event;
      const shortCutData = await threadsData.get(threadID, 'data.shortcut', []);
      const lang = getLang();

      switch (args[0]) {
        case 'add': {
          const split = body.split(' ').slice(2).join(' ').split('=>');
          const attachments = [
            ...event.attachments,
            ...(event.messageReply?.attachments || [])
          ].filter(item => ["photo", "animated_image", "video", "audio"].includes(item.type));

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
                  commandName: this.config.name,
                  messageID: info.messageID,
                  author: senderID,
                  type: 'replaceContent',
                  newShortcut: await this.createShortcut(key, content, attachments, threadID, senderID)
                });
              });
            }
            return message.reply(lang.shortcutExistsByOther.replace('%1', key));
          }

          const newShortcut = await this.createShortcut(key, content, attachments, threadID, senderID);
          shortCutData.push(newShortcut);
          await threadsData.set(threadID, shortCutData, 'data.shortcut');

          let msg = lang.added.replace('%1', key).replace('%2', content || '(No text)');
          if (newShortcut.attachments.length)
            msg += lang.addedAttachment.replace('%1', newShortcut.attachments.length);
          return message.reply(msg);
        }

        case 'del':
        case 'delete': {
          const key = args.slice(1).join(' ')?.trim()?.toLowerCase();
          if (!key) return message.reply(lang.missingKey);
          
          const index = shortCutData.findIndex(x => x.key === key);
          if (index === -1) return message.reply(lang.notFound.replace('%1', key));
          
          if (senderID !== shortCutData[index].author && role < 1)
            return message.reply(lang.onlyAdmin);
          
          shortCutData.splice(index, 1);
          await threadsData.set(threadID, shortCutData, 'data.shortcut');
          return message.reply(lang.deleted.replace('%1', key));
        }

        case 'list': {
          if (shortCutData.length === 0)
            return message.reply(lang.empty);
          
          let filteredList = shortCutData;
          let title = lang.list;

          if (args[1]) {
            const type = args[1];
            const keyword = args.slice(2).join(' ').toLowerCase();

            if (type === "start") {
              filteredList = shortCutData.filter(x => x.key.startsWith(keyword));
              title = lang.listWithTypeStart.replace('%1', keyword);
            } 
            else if (type === "end") {
              filteredList = shortCutData.filter(x => x.key.endsWith(keyword));
              title = lang.listWithTypeEnd.replace('%1', keyword);
            }
            else if (["contain", "has", "include"].includes(type)) {
              filteredList = shortCutData.filter(x => x.key.includes(keyword));
              title = lang.listWithTypeContain.replace('%1', keyword);
            }

            if (filteredList.length === 0) {
              if (type === "start") return message.reply(lang.listWithTypeStartNot.replace('%1', keyword));
              if (type === "end") return message.reply(lang.listWithTypeEndNot.replace('%1', keyword));
              return message.reply(lang.listWithTypeContainNot.replace('%1', keyword));
            }
          }

          const list = await Promise.all(
            filteredList.map(async (x, i) => {
              const num = i + 1;
              const msgCount = x.content ? `1 ${lang.message}` : '';
              const attachCount = x.attachments.length ? `${x.attachments.length} ${lang.attachment}` : '';
              const authorName = await usersData.getName(x.author);
              
              return `${num}. ${x.key} => ${[msgCount, attachCount].filter(Boolean).join(', ')} (by ${authorName})`;
            })
          );

          return message.reply(`${title}\n\n${list.join('\n')}`);
        }

        case 'reset':
        case 'remove': {
          if (role < 1) return message.reply(lang.onlyAdminRemoveAll);
          return message.reply(lang.confirmRemoveAll, (err, info) => {
            if (err) return;
            global.GoatBot.onReaction.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: senderID,
              type: 'removeAll'
            });
          });
        }

        default:
          return message.SyntaxError();
      }
    } catch (err) {
      console.error('[SHORTCUT ERROR]', err);
      return message.reply('⚠️ An error occurred. Please try again.');
    }
  },

  onReaction: async function ({ event, message, threadsData, getLang, Reaction }) {
    const { author, type } = Reaction;
    if (event.userID !== author) return;

    const lang = getLang();
    
    if (type === 'removeAll') {
      await threadsData.set(event.threadID, [], "data.shortcut");
      return message.reply(lang.removedAll);
    }
    else if (type === 'replaceContent') {
      const shortCutData = await threadsData.get(event.threadID, 'data.shortcut', []);
      const index = shortCutData.findIndex(x => x.key === Reaction.newShortcut.key);
      
      if (index === -1) shortCutData.push(Reaction.newShortcut);
      else shortCutData[index] = Reaction.newShortcut;
      
      await threadsData.set(event.threadID, shortCutData, 'data.shortcut');
      
      let msg = lang.added
        .replace('%1', Reaction.newShortcut.key)
        .replace('%2', Reaction.newShortcut.content || '(No text)');
      
      if (Reaction.newShortcut.attachments.length) {
        msg += lang.addedAttachment.replace('%1', Reaction.newShortcut.attachments.length);
      }
      
      return message.reply(msg);
    }
  },

  onChat: async ({ threadsData, message, event }) => {
    const { threadID, body } = event;
    const shortcut = body?.toLowerCase().trim();
    if (!shortcut) return;

    const dataShortcut = await threadsData.get(threadID, 'data.shortcut', []);
    const matched = dataShortcut.find(x => x.key === shortcut);
    if (!matched) return;

    const attachments = await Promise.all(
      matched.attachments.map(id => drive.getFile(id, 'stream', true))
    );

    return message.reply({
      body: matched.content || '',
      attachment: attachments
    });
  },

  createShortcut: async function (key, content, attachments, threadID, senderID) {
    const attachmentIDs = await Promise.all(
      attachments.map(async attachment => {
        const ext = attachment.type === "audio" ? "mp3" : getExtFromUrl(attachment.url);
        const fileName = `shortcut_${threadID}_${senderID}_${Date.now()}.${ext}`;
        const stream = await getStreamFromURL(attachment.url);
        const file = await drive.uploadFile(fileName, attachment.type === "audio" ? "audio/mpeg" : undefined, stream);
        return file.id;
      })
    );

    return {
      key: key.trim().toLowerCase(),
      content: content.trim(),
      attachments: attachmentIDs,
      author: senderID
    };
  }
};
