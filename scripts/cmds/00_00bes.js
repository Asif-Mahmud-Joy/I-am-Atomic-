const axios = require('axios');

module.exports = {
	config: {
		name: 'bes',
		version: '2.0',
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
				api.setMessageReaction("⏳", event.messageID, (err) => console.log(err), true);
				const processingMessage = await api.sendMessage(
					`🔄 Besh kichu vabteche... ekto opekkha korun...`,
					event.threadID
				);

				const apiUrl = `https://aemt.me/besh?q=${encodeURIComponent(query)}`;
				const response = await axios.get(apiUrl);

				if (response.data && response.data.message) {
					const trimmedMessage = response.data.message.trim();
					api.setMessageReaction("✅", event.messageID, (err) => console.log(err), true);
					await api.sendMessage({ body: `🗣️ ${trimmedMessage}` }, event.threadID, event.messageID);
				} else {
					throw new Error(`😓 Besh kichu bolte parlo na. Try abar.`);
				}

				await api.unsendMessage(processingMessage.messageID);
			}
		} catch (error) {
			console.error(`❌ | Besh error: ${error.message}`);
			const errorMessage = `❌ | Besh er sathe jogajog korte somossa hocche. Try abar pore.

🔁 Somvoboto server e problem ase.`;
			api.sendMessage(errorMessage, event.threadID);
		}
	},
};
