const axios = require('axios');

module.exports = {
	config: {
		name: 'bes2',
		version: '3.0',
		author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
		role: 0,
		category: 'Ai-Chat',
		shortDescription: {
			en: 'Talk with besh',
			bn: 'বেশ এর সাথে গল্প করো'
		},
		longDescription: {
			en: 'Chat with besh your friendly gossip bot',
			bn: 'তোমার আড্ডাবাজ বন্ধুবেশ এর সাথে চ্যাট করো!'
		},
		guide: {
			en: '{pn}bes <your text>',
			bn: '{pn}bes <তোমার লেখা>'
		},
	},

	onStart: async function ({ api, event, args, usersData }) {
		try {
			const query = args.join(" ") || "hello";
			const { name } = (await usersData.get(event.senderID));

			if (query) {
				// Atomic processing reaction
				api.setMessageReaction("☢️", event.messageID, (err) => console.log(err), true);
				
				// Atomic processing message
				const processingMessage = await api.sendMessage(
					`☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n\n⚛️ ATOMIC CORE PROCESSING...\n💠 QUERY: ${query}\n\n☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`,
					event.threadID
				);

				const apiUrl = `https://aemt.me/besh?q=${encodeURIComponent(query)}`;
				const response = await axios.get(apiUrl);

				if (response.data && response.data.message) {
					const trimmedMessage = response.data.message.trim();
					api.setMessageReaction("⚛️", event.messageID, (err) => console.log(err), true);
					
					// Atomic formatted response
					await api.sendMessage(
						{ 
							body: `☢️ ════ ATOMIC RESPONSE ════ ☢️\n\n⚛️ ${trimmedMessage}\n\n☣️ ────────────────\n💠 SYSTEM: v3.0 | ATOMIC CORE`
						}, 
						event.threadID, 
						event.messageID
					);
				} else {
					throw new Error(`ATOMIC PROCESSING FAILURE`);
				}

				await api.unsendMessage(processingMessage.messageID);
			}
		} catch (error) {
			console.error(`☣️ | ATOMIC ERROR: ${error.message}`);
			// Atomic error message
			const errorMessage = `☢️ ════ ATOMIC SYSTEM FAILURE ════ ☢️\n\n☣️ ERROR CODE: BESH-404\n⚛️ REASON: Core response failure\n💠 SOLUTION: Retry operation\n\n☣️ ────────────────\n⚡ POWERED BY ATOMIC CORE v3.0`;
			api.sendMessage(errorMessage, event.threadID);
		}
	},
};
