const axios = require("axios");

module.exports = {
  config: {
    name: "ip",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    category: "utility",
    shortDescription: {
      en: "Check IP address information",
      bn: "IP address এর তথ্য দেখুন"
    },
    guide: {
      en: "{pn} [IP Address]",
      bn: "{pn} [আইপি ঠিকানা]"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const ip = args.join(" ").trim();
      if (!ip)
        return api.sendMessage("❗ দয়া করে একটি IP ঠিকানা দিন!\nUsage: ip [address]", event.threadID, event.messageID);

      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const data = response.data;

      if (data.error || !data.ip) {
        return api.sendMessage("❌ এই IP address খুঁজে পাওয়া যায়নি বা ভ্যালিড নয়!", event.threadID, event.messageID);
      }

      const msg = `📍 IP Address Info:

✅ IP: ${data.ip}
🌐 Country: ${data.country_name} (${data.country})
🏙 City: ${data.city || "N/A"}
🧭 Region: ${data.region || "N/A"}
🕰 Timezone: ${data.timezone || "N/A"}
📡 ISP: ${data.org || "N/A"}
📌 Latitude: ${data.latitude}, Longitude: ${data.longitude}`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.error("[IP CMD ERROR]:", error.message);
      return api.sendMessage("🚫 কিছু ভুল হয়েছে! পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  }
};
