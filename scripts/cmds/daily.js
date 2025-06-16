const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "2.0",
		author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
		countDown: 5,
		role: 0,
		description: {
			bn: "প্রতিদিন উপহার নাও",
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			bn: "{pn}: প্রতিদিনের উপহার নাও\n{pn} info: উপহারের তালিকা দেখো",
			en: "{pn}\n{pn} info: View daily gift information"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
		}
	},

	langs: {
		bn: {
			monday: "সোমবার",
			tuesday: "মঙ্গলবার",
			wednesday: "বুধবার",
			thursday: "বৃহস্পতিবার",
			friday: "শুক্রবার",
			saturday: "শনিবার",
			sunday: "রবিবার",
			alreadyReceived: "❌ তুমি আজকের উপহার আগেই নিয়েছো!",
			received: "✅ তুমি পেয়েছো %1 কয়েন এবং %2 এক্সপি"
		},
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received today's gift",
			received: "You have received %1 coin and %2 exp"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;
		if (args[0] == "info") {
			let msg = "🎁 Weekly Reward List:\n";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 0.2) ** (i - 1));
				const getExp = Math.floor(reward.exp * (1 + 0.2) ** (i - 1));
				const day = getLang(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][i - 1]);
				msg += `🔹 ${day}: ${getCoin}🪙, ${getExp}⭐\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const currentDay = moment.tz("Asia/Dhaka").day();
		const { senderID } = event;
		const userData = await usersData.get(senderID);

		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = Math.floor(reward.coin * (1 + 0.2) ** ((currentDay === 0 ? 7 : currentDay) - 1));
		const getExp = Math.floor(reward.exp * (1 + 0.2) ** ((currentDay === 0 ? 7 : currentDay) - 1));
		userData.data.lastTimeGetReward = dateTime;

		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});

		message.reply(getLang("received", getCoin, getExp));
	}
};
