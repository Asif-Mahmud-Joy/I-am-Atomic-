const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
	config: {
		name: "setleave",
		aliases: ["setl"],
		version: "2.0-ultra",
		author: "Mr.Smokey [Asif Mahmud]",
		countDown: 5,
		role: 0,
		description: {
			vi: "Chỉnh sửa nội dung/bật/tắt tin nhắn tạm biệt thành viên rời khỏi nhóm chat của bạn",
			en: "Edit content/turn on/off leave message when member leaves your group chat"
		},
		category: "custom",
		guide: {
			vi: {
				body: `   {pn} on: Bật tin nhắn tạm biệt
   {pn} off: Tắt tin nhắn tạm biệt
   {pn} text [<nội dung> | reset]: chỉnh sửa hoặc reset nội dung tin nhắn
   {pn} file: thêm file ảnh/video/audio hoặc reset

Shortcut:
 + {userName} - tên người rời nhóm
 + {userNameTag} - tag tên
 + {boxName} - tên nhóm
 + {type} - rời/bị xóa
 + {session} - buổi trong ngày`,
				attachment: {
					[`${__dirname}/assets/guide/setleave/setleave_vi_1.png`]: "https://i.ibb.co/2FKJHJr/guide1.png"
				}
			},
			en: {
				body: `   {pn} on: Turn on leave message
   {pn} off: Turn off leave message
   {pn} text [<content> | reset]: edit or reset message content
   {pn} file: add image/video/audio file or reset

Shortcut:
 + {userName} - member's name
 + {userNameTag} - tag name
 + {boxName} - group name
 + {type} - left/kicked
 + {session} - time of day` ,
				attachment: {
					[`${__dirname}/assets/guide/setleave/setleave_en_1.png`]: "https://i.ibb.co/2FKJHJr/guide1.png"
				}
			}
		}
	},

	langs: {
		vi: {
			turnedOn: "✅ Đã bật tin nhắn tạm biệt",
			turnedOff: "🚫 Đã tắt tin nhắn tạm biệt",
			missingContent: "⚠️ Nhập nội dung tin nhắn",
			edited: "✏️ Nội dung tin nhắn mới:\n%1",
			reseted: "🔄 Đã reset nội dung về mặc định",
			noFile: "⚠️ Không có file để xóa",
			resetedFile: "✅ Đã reset file thành công",
			missingFile: "⚠️ Gửi hoặc reply kèm file ảnh/video/audio",
			addedFile: "📎 Đã thêm %1 tệp vào tin nhắn tạm biệt"
		},
		en: {
			turnedOn: "✅ Leave message turned on",
			turnedOff: "🚫 Leave message turned off",
			missingContent: "⚠️ Please enter the message content",
			edited: "✏️ New leave message content:\n%1",
			reseted: "🔄 Message content reset to default",
			noFile: "⚠️ No file to delete",
			resetedFile: "✅ Attachment file reset successfully",
			missingFile: "⚠️ Send or reply with image/video/audio file",
			addedFile: "📎 %1 file(s) added to leave message"
		}
	},

	onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
		const { threadID, senderID, body } = event;
		const { data, settings } = await threadsData.get(threadID);

		switch (args[0]) {
			case "text": {
				if (!args[1]) return message.reply(getLang("missingContent"));
				if (args[1] === "reset") delete data.leaveMessage;
				else data.leaveMessage = body.slice(body.indexOf(args[0]) + args[0].length).trim();

				await threadsData.set(threadID, { data });
				return message.reply(data.leaveMessage ? getLang("edited", data.leaveMessage) : getLang("reseted"));
			}
			case "file": {
				if (args[1] === "reset") {
					if (!data.leaveAttachment) return message.reply(getLang("noFile"));
					try {
						await Promise.all(data.leaveAttachment.map(id => drive.deleteFile(id)));
						delete data.leaveAttachment;
						await threadsData.set(threadID, { data });
						return message.reply(getLang("resetedFile"));
					} catch (e) {}
				} else if (!event.attachments.length && (!event.messageReply || !event.messageReply.attachments.length)) {
					return message.reply(getLang("missingFile"), (err, info) => {
						global.GoatBot.onReply.set(info.messageID, { messageID: info.messageID, author: senderID, commandName });
					});
				} else {
					saveChanges(message, event, threadID, senderID, threadsData, getLang);
				}
				break;
			}
			case "on":
			case "off": {
				settings.sendLeaveMessage = args[0] === "on";
				await threadsData.set(threadID, { settings });
				return message.reply(getLang(args[0] === "on" ? "turnedOn" : "turnedOff"));
			}
			default:
				return message.SyntaxError();
		}
	},

	onReply: async function ({ event, Reply, message, threadsData, getLang }) {
		if (event.senderID !== Reply.author) return;
		if (!event.attachments.length && (!event.messageReply || !event.messageReply.attachments.length))
			return message.reply(getLang("missingFile"));
		saveChanges(message, event, event.threadID, event.senderID, threadsData, getLang);
	}
};

async function saveChanges(message, event, threadID, senderID, threadsData, getLang) {
	const { data } = await threadsData.get(threadID);
	const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(a => ["photo", "animated_image", "video", "audio"].includes(a.type));
	if (!data.leaveAttachment) data.leaveAttachment = [];

	await Promise.all(attachments.map(async attachment => {
		const { url } = attachment;
		const ext = getExtFromUrl(url);
		const fileName = `leave_${getTime()}.${ext}`;
		const infoFile = await drive.uploadFile(`leave_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
		data.leaveAttachment.push(infoFile.id);
	}));

	await threadsData.set(threadID, { data });
	message.reply(getLang("addedFile", attachments.length));
}
