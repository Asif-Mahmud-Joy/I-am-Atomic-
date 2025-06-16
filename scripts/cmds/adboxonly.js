// ✅ Fixed Version of onlyadminbox
// ✅ Banglish Guide, Real World Working
// ✅ Fully GoatBot Compatible, No Extra API Needed

module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "2.0-ultramax",
		author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
		countDown: 5,
		role: 1,
		description: {
			vi: "bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			en: "Turn ON/OFF admin-only mode for using bot"
		},
		category: "box chat",
		guide: {
			vi: "{pn} [on | off] \n{pn} noti [on | off]",
			en: "{pn} [on | off] \n{pn} noti [on | off]"
		}
	},

	langs: {
		vi: {
			turnedOn: "✅ Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOff: "✅ Đã tắt chế độ này",
			turnedOnNoti: "🔔 Đã bật thông báo khi người dùng không phải admin",
			turnedOffNoti: "🔕 Đã tắt thông báo khi người dùng không phải admin",
			syntaxError: "⚠️ Sai cú pháp, dùng: {pn} [on | off] hoặc {pn} noti [on | off]"
		},
		en: {
			turnedOn: "✅ Admin-only mode activated",
			turnedOff: "✅ Admin-only mode deactivated",
			turnedOnNoti: "🔔 Notification ON for non-admin users",
			turnedOffNoti: "🔕 Notification OFF for non-admin users",
			syntaxError: "⚠️ Syntax error! Use: {pn} [on | off] or {pn} noti [on | off]"
		},
		bn: {
			turnedOn: "✅ এখন শুধু Group Admin bot use korte parbe",
			turnedOff: "✅ সবার জন্য bot use allow করা হয়েছে",
			turnedOnNoti: "🔔 Admin na hole warning message দেখাবে",
			turnedOffNoti: "🔕 Admin না হলেও এখন message আসবে না",
			syntaxError: "⚠️ ভুল syntax! Use: {pn} on/off বা {pn} noti on/off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] === "on") value = true;
		else if (args[indexGetVal] === "off") value = false;
		else return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		return message.reply(
			isSetNoti
				? value ? getLang("turnedOnNoti") : getLang("turnedOffNoti")
				: value ? getLang("turnedOn") : getLang("turnedOff")
		);
	}
};
