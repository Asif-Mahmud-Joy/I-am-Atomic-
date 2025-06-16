module.exports = {
	config: {
		name: "tid",
		version: "1.3",
		author: "Mr.Smokey {Asif Mahmud}",
		countDown: 3,
		role: 0,
		description: {
			vi: "Xem ID nhóm chat của bạn",
			en: "View the thread ID of your chat"
		},
		category: "info",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message, event, api }) {
		try {
			const threadID = event.threadID;
			const threadInfo = await api.getThreadInfo(threadID);

			const name = threadInfo.threadName || "Unknown";
			const participantCount = threadInfo.participantIDs?.length || 0;

			message.reply(
				`\u{1F50E} Group Info:
\u{1F197} Thread ID: ${threadID}
\u{1F4DB} Name: ${name}
\u{1F465} Members: ${participantCount}`
			);
		} catch (error) {
			console.error("[tid] Error fetching thread info:", error);
			message.reply("\u274C Failed to fetch thread info. Please try again later.");
		}
	}
};
