const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");

// 𝗖𝗥𝗘𝗔𝗧𝗜𝗩𝗘 𝗗𝗘𝗦𝗜𝗚𝗡 𝗘𝗟𝗘𝗠𝗘𝗡𝗧𝗦
const WEATHER_ICONS = {
  1: "☀️",  // Sunny
  2: "⛅",  // Partly Sunny  
  3: "⛅",  // Mostly Sunny
  4: "☁️",  // Cloudy
  5: "🌤️",  // Mostly Cloudy
  6: "🌥️",  // Partly Cloudy
  7: "🌦️",  // Partly Sunny w/ Showers
  8: "🌧️",  // Rain
  9: "⛈️",  // Thunderstorms
  10: "🌨️", // Snow
  11: "❄️",  // Cold
  12: "🌫️",  // Fog
  13: "🌪️",  // Windy
  14: "🌑",  // Clear Night
  15: "🌙"   // Partly Cloudy Night
};

const BANNER = `
╔════════════════════════════╗
║       ☀️ WEATHER REPORT ☀️      ║
╚════════════════════════════╝
`;

// 𝗙𝗢𝗡𝗧 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗧𝗜𝗢𝗡
Canvas.registerFont(__dirname + "/assets/font/BeVietnamPro-SemiBold.ttf", {family: "BeVietnamPro-SemiBold"});
Canvas.registerFont(__dirname + "/assets/font/BeVietnamPro-Regular.ttf", {family: "BeVietnamPro-Regular"});

// 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 𝗙𝗨𝗡𝗖𝗧𝗜𝗢𝗡𝗦
const convertFtoC = F => Math.floor((F - 32) / 1.8);
const formatTime = (hours, timezone) => moment(hours).tz(timezone).format("h:mm A");

// 𝗠𝗔𝗜𝗡 𝗠𝗢𝗗𝗨𝗟𝗘
module.exports = {
  config: {
    name: "weather",
    version: "3.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "🌈 Get beautifully formatted weather forecasts with creative visuals"
    },
    category: "𝗨𝗧𝗜𝗟𝗜𝗧𝗬",
    guide: {
      en: `🌍 𝗨𝗦𝗔𝗚𝗘:\n» {pn} <location>\n» Example: {pn} Paris\n━━━━━━━━━━━━━━━━━━━`
    },
    envConfig: {
      weatherApiKey: "YOUR_API_KEY" // Replace with actual API key
    }
  },

  langs: {
    en: {
      syntaxError: `⚠️ 𝗜𝗡𝗣𝗨𝗧 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━━━━━━\nPlease enter a location\nExample: {pn} Tokyo`,
      notFound: `🌐 𝗟𝗢𝗖𝗔𝗧𝗜𝗢𝗡 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗\n━━━━━━━━━━━━━━━━━━━\n"${1}" not found\nTry a nearby city or check spelling`,
      error: `⚡ 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━━━━━━\n${1}\nPlease try again later`,
      today: `${BANNER}
📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${1}
📝 𝗦𝘂𝗺𝗺𝗮𝗿𝘆: ${2}

🌡️ 𝗧𝗲𝗺𝗽𝗲𝗿𝗮𝘁𝘂𝗿𝗲:
├─ Low: ${3}°C ${7}
└─ High: ${4}°C ${8}

🌬️ 𝗙𝗲𝗲𝗹𝘀 𝗟𝗶𝗸𝗲: 
├─ Day: ${5}°C
└─ Night: ${6}°C

⏳ 𝗧𝗶𝗺𝗲𝘀:
├─ ☀️ Sunrise: ${9}
├─ 🌇 Sunset: ${10} 
├─ 🌕 Moonrise: ${11}
└─ 🌑 Moonset: ${12}

📡 𝗙𝗼𝗿𝗲𝗰𝗮𝘀𝘁:
├─ 🌞 Day: ${13}
└─ 🌙 Night: ${14}
━━━━━━━━━━━━━━━━━━━`
    }
  },

  onStart: async function ({ args, message, getLang, envGlobal }) {
    const apikey = envGlobal.weatherApiKey;
    const area = args.join(" ");
    
    if (!area) return message.reply(getLang("syntaxError"));

    try {
      // 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻 𝗦𝗲𝗮𝗿𝗰𝗵
      const locationResponse = await axios.get(
        `https://dataservice.accuweather.com/locations/v1/cities/search`,
        { params: { apikey, q: encodeURIComponent(area), language: "en-us" }, timeout: 5000 }
      );

      if (!locationResponse.data.length) {
        return message.reply(getLang("notFound", area));
      }

      const locationData = locationResponse.data[0];
      const { Key: areaKey, LocalizedName: areaName, TimeZone: { Name: timezone } } = locationData;

      // 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗗𝗮𝘁𝗮
      const weatherResponse = await axios.get(
        `https://dataservice.accuweather.com/forecasts/v1/daily/10day/${areaKey}`,
        { params: { apikey, details: true, language: "en-us" }, timeout: 5000 }
      );

      const weatherData = weatherResponse.data;
      const today = weatherData.DailyForecasts[0];
      const icon = WEATHER_ICONS[today.Day.Icon] || "🌈";

      // 𝗖𝗿𝗲𝗮𝘁𝗲 𝗠𝗲𝘀𝘀𝗮𝗴𝗲
      const msg = getLang("today",
        `${areaName} ${icon}`,
        weatherData.Headline.Text,
        convertFtoC(today.Temperature.Minimum.Value),
        convertFtoC(today.Temperature.Maximum.Value),
        convertFtoC(today.RealFeelTemperature.Minimum.Value),
        convertFtoC(today.RealFeelTemperature.Maximum.Value),
        today.Temperature.Minimum.Unit === "F" ? "°F" : "",
        today.Temperature.Maximum.Unit === "F" ? "°F" : "",
        formatTime(today.Sun.Rise, timezone),
        formatTime(today.Sun.Set, timezone),
        formatTime(today.Moon.Rise, timezone),
        formatTime(today.Moon.Set, timezone),
        today.Day.LongPhrase,
        today.Night.LongPhrase
      );

      // 𝗖𝗿𝗲𝗮𝘁𝗲 𝗩𝗶𝘀𝘂𝗮𝗹 𝗖𝗮𝗿𝗱
      const bg = await Canvas.loadImage(__dirname + "/assets/image/bgWeather.jpg");
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      
      // Draw background with overlay
      ctx.drawImage(bg, 0, 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw 7-day forecast
      let x = 50;
      weatherData.DailyForecasts.slice(0, 7).forEach(day => {
        const iconCode = day.Day.Icon;
        const weatherIcon = WEATHER_ICONS[iconCode] || "✨";
        
        // Draw date
        ctx.font = "20px BeVietnamPro-SemiBold";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(moment(day.Date).format("ddd"), x + 10, 100);
        
        // Draw weather icon
        ctx.font = "30px Arial";
        ctx.fillText(weatherIcon, x + 25, 150);
        
        // Draw temperatures
        ctx.font = "18px BeVietnamPro-Regular";
        ctx.fillText(`${convertFtoC(day.Temperature.Maximum.Value)}°`, x + 15, 200);
        ctx.fillText(`${convertFtoC(day.Temperature.Minimum.Value)}°`, x + 15, 230);
        
        x += 80;
      });

      // Add creative footer
      ctx.font = "16px BeVietnamPro-Regular";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(`🌦️ Weather powered by AccuWeather • ${moment().format("MMMM Do, h:mm a")}`, 20, canvas.height - 20);

      // Save and send
      const imagePath = `${__dirname}/tmp/weather_${areaKey}.jpg`;
      fs.writeFileSync(imagePath, canvas.toBuffer());
      
      await message.reply({
        body: msg,
        attachment: fs.createReadStream(imagePath)
      });
      
      fs.unlinkSync(imagePath);
      
    } catch (error) {
      console.error("Weather Error:", error);
      const errorMsg = error.response?.data?.Message || error.message;
      message.reply(getLang("error", errorMsg));
    }
  }
};
