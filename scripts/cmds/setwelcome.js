const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
    config: {
        name: "setwelcome",
        aliases: ["setwc"],
        version: "2.1",
        author: "Asif",
        countDown: 5,
        role: 1,
        description: {
            en: "✨ Customize welcome messages with advanced formatting ✨"
        },
        category: "group",
        guide: {
            en: {
                body: `
╔═══════❖•°♛°•❖═══════╗
  🎀 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗦𝗘𝗧𝗨𝗣  🎀
╚═══════❖•°♛°•❖═══════╝

⚡ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:
❯ ${pn} text [<message> | reset]
❯ ${pn} file [reset | reply attachment]
❯ ${pn} on/off

☄ 𝗩𝗮𝗿𝗶𝗮𝗯𝗹𝗲𝘀:
✦ {userName} - New member's name
✦ {userNameTag} - Tagged name
✦ {boxName} - Group name
✦ {multiple} - "you" or "you all"
✦ {session} - Time of day
✦ {memLength} - Member count

💎 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
❯ ${pn} text Welcome {userName} to {boxName}! 🌸
❯ ${pn} file (reply with media)
❯ ${pn} file reset
`
            }
        }
    },

    langs: {
        en: {
            turnedOn: "🔮 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝗘𝗡𝗔𝗕𝗟𝗘𝗗 ✨",
            turnedOff: "💢 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗 ❌",
            missingText: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗲𝘅𝘁",
            textSet: `✍️ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘀𝗲𝘁:

『 %1 』`,
            textReset: "♻️ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗿𝗲𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗳𝗮𝘂𝗹𝘁",
            noFiles: "📭 𝗡𝗼 𝗮𝘁𝘁𝗮𝗰𝗵𝗺𝗲𝗻𝘁𝘀 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲",
            filesReset: "🗑️ 𝗔𝘁𝘁𝗮𝗰𝗵𝗺𝗲𝗻𝘁𝘀 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗿𝗲𝗺𝗼𝘃𝗲𝗱",
            needFiles: `📎 𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗳𝗶𝗹𝗲𝘀 𝘁𝗼 𝗮𝗱𝗱:

🖼️ 𝗜𝗺𝗮𝗴𝗲 | 🎥 𝗩𝗶𝗱𝗲𝗼 | 🎵 𝗔𝘂𝗱𝗶𝗼`,
            filesAdded: `📦 𝗔𝗱𝗱𝗲𝗱 %1 𝗮𝘁𝘁𝗮𝗰𝗵𝗺𝗲𝗻𝘁(𝘀):

✨ 𝗧𝘆𝗽𝗲𝘀: %2`,
            invalidCommand: "⚡ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝘂𝘀𝗮𝗴𝗲",
            error: "💥 𝗘𝗿𝗿𝗼𝗿: %1"
        }
    },

    onStart: async function ({ args, threadsData, message, event, getLang }) {
        try {
            const { threadID, senderID, body } = event;
            const { data } = await threadsData.get(threadID);

            const action = args[0]?.toLowerCase();
            const subAction = args[1]?.toLowerCase();

            switch (action) {
                case "text":
                    await this.handleText(args, body, data, threadsData, threadID, message, getLang);
                    break;

                case "file":
                    await this.handleFile(args, event, data, threadsData, threadID, senderID, message, getLang);
                    break;

                case "on":
                case "off":
                    data.sendWelcomeMessage = action === "on";
                    await threadsData.set(threadID, { data });
                    message.reply(getLang(action === "on" ? "turnedOn" : "turnedOff"));
                    break;

                default:
                    message.reply(getLang("invalidCommand"));
            }
        } catch (err) {
            message.reply(getLang("error", err.message));
            console.error("⚡ 𝗦𝗘𝗧𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗘𝗥𝗥𝗢𝗥:", err);
        }
    },

    handleText: async function (args, body, data, threadsData, threadID, message, getLang) {
        if (!args[1]) return message.reply(getLang("missingText"));
        
        if (args[1] === "reset") {
            delete data.welcomeMessage;
            await threadsData.set(threadID, { data });
            return message.reply(getLang("textReset"));
        }

        const text = body.slice(body.indexOf(args[0]) + args[0].length).trim();
        data.welcomeMessage = text;
        await threadsData.set(threadID, { data });
        message.reply(getLang("textSet", text));
    },

    handleFile: async function (args, event, data, threadsData, threadID, senderID, message, getLang) {
        if (args[1] === "reset") {
            if (!data.welcomeAttachment) return message.reply(getLang("noFiles"));
            try {
                await Promise.all(data.welcomeAttachment.map(fileId => drive.deleteFile(fileId)));
                delete data.welcomeAttachment;
                await threadsData.set(threadID, { data });
                return message.reply(getLang("filesReset"));
            } catch (err) {
                console.error("⚡ 𝗙𝗜𝗟𝗘 𝗗𝗘𝗟𝗘𝗧𝗘 𝗘𝗥𝗥𝗢𝗥:", err);
                return message.reply(getLang("error", "Failed to delete files"));
            }
        }

        if (!event.attachments?.length && !event.messageReply?.attachments?.length) {
            return message.reply(getLang("needFiles"), (err, info) => {
                if (err) return console.error("⚡ 𝗥𝗘𝗣𝗟𝗬 𝗘𝗥𝗥𝗢𝗥:", err);
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    author: senderID,
                    messageID: info.messageID
                });
            });
        }

        await this.saveAttachments(event, data, threadsData, threadID, senderID, message, getLang);
    },

    saveAttachments: async function (event, data, threadsData, threadID, senderID, message, getLang) {
        const attachments = [
            ...(event.attachments || []),
            ...(event.messageReply?.attachments || [])
        ].filter(att => ["photo", "animated_image", "video", "audio"].includes(att.type));

        if (!attachments.length) return message.reply(getLang("needFiles"));

        if (!data.welcomeAttachment) data.welcomeAttachment = [];

        try {
            const fileTypes = attachments.map(att => {
                switch (att.type) {
                    case "photo": return "🖼️ Image";
                    case "animated_image": return "🎆 GIF";
                    case "video": return "🎥 Video";
                    case "audio": return "🎵 Audio";
                    default: return "📄 File";
                }
            }).join(", ");

            await Promise.all(attachments.map(async attachment => {
                const { url, type } = attachment;
                const ext = getExtFromUrl(url);
                const fileName = `welcome_${threadID}_${getTime()}.${ext}`;
                const stream = await getStreamFromURL(url);
                const file = await drive.uploadFile(fileName, stream);
                data.welcomeAttachment.push(file.id);
            }));

            await threadsData.set(threadID, { data });
            message.reply(getLang("filesAdded", attachments.length, fileTypes));
        } catch (err) {
            console.error("⚡ 𝗔𝗧𝗧𝗔𝗖𝗛𝗠𝗘𝗡𝗧 𝗘𝗥𝗥𝗢𝗥:", err);
            message.reply(getLang("error", "Failed to save attachments"));
        }
    },

    onReply: async function ({ event, Reply, message, threadsData, getLang }) {
        if (event.senderID !== Reply.author) return;
        
        const { threadID, senderID } = event;
        const { data } = await threadsData.get(threadID);
        
        await this.saveAttachments(event, data, threadsData, threadID, senderID, message, getLang);
    }
};
