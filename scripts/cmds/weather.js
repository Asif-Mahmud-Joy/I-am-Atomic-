// Updated and upgraded GoatBot weather command with Bengali language support
const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");

Canvas.registerFont(
  __dirname + "/assets/font/BeVietnamPro-SemiBold.ttf",
  { family: "BeVietnamPro-SemiBold" }
);
Canvas.registerFont(
  __dirname + "/assets/font/BeVietnamPro-Regular.ttf",
  { family: "BeVietnamPro-Regular" }
);

function convertFtoC(F) {
  return Math.floor((F - 32) / 1.8);
}

function formatHours(hours) {
  return moment(hours).tz("Asia/Dhaka").format("HH[h]mm[p]");
}

module.exports = {
  config: {
    name: "weather",
    version: "1.3",
    author: "Mr.Smokey",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem dự báo thời tiết hiện tại và 5 ngày sau",
      en: "view the current and next 5 days weather forecast",
      bn: "বর্তমান এবং পরবর্তী ৫ দিনের আবহাওয়ার পূর্বাভাস দেখুন"
    },
    category: "other",
    guide: {
      vi: "{pn} <địa điểm>",
      en: "{pn} <location>",
      bn: "{pn} <অবস্থান>"
    },
    envGlobal: {
      weatherApiKey: { type: "string", required: true } // ✅ Fixed as proper object
    }
  },

  langs: {
    bn: {
      syntaxError: "দয়া করে একটি অবস্থান লিখুন",
      notFound: "অবস্থান খুঁজে পাওয়া যায়নি: %1",
      error: "একটি ত্রুটি ঘটেছে: %1",
      today: "আজকের আবহাওয়া: %1\n%2\n🌡 সর্বনিম্ন - সর্বোচ্চ তাপমাত্রা %3°C - %4°C\n🌡 অনুভূত তাপমাত্রা %5°C - %6°C\n🌅 সূর্যোদয় %7\n🌄 সূর্যাস্ত %8\n🌃 চাঁদোদয় %9\n🏙️ চাঁদাস্ত %10\n🌞 দিন: %11\n🌙 রাত: %12"
    },
    en: {
      syntaxError: "Please enter a location",
      notFound: "Location not found: %1",
      error: "An error has occurred: %1",
      today: "Today's weather: %1\n%2\n🌡 Low - high temperature %3°C - %4°C\n🌡 Feels like %5°C - %6°C\n🌅 Sunrise %7\n🌄 Sunset %8\n🌃 Moonrise %9\n🏙️ Moonset %10\n🌞 Day: %11\n🌙 Night: %12"
    },
    vi: {
      syntaxError: "Vui lòng nhập địa điểm",
      notFound: "Không thể tìm thấy địa điểm: %1",
      error: "Đã xảy ra lỗi: %1",
      today: "Thời tiết hôm nay: %1\n%2\n🌡 Nhiệt độ thấp nhất - cao nhất %3°C - %4°C\n🌡 Nhiệt độ cảm nhận được %5°C - %6°C\n🌅 Mặt trời mọc %7\n🌄 Mặt trời lặn %8\n🌃 Mặt trăng mọc %9\n🏙️ Mặt trăng lặn %10\n🌞 Ban ngày: %11\n🌙 Ban đêm: %12"
    }
  },

  onStart: async function ({ args, message, envGlobal, getLang }) {
    const apikey = envGlobal.weatherApiKey;
    const area = args.join(" ");
    if (!area)
      return message.reply(getLang("syntaxError"));

    let areaKey, dataWeather, areaName;
    try {
      const response = (await axios.get(`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apikey}&q=${encodeURIComponent(area)}&language=bn`)).data;
      if (response.length === 0)
        return message.reply(getLang("notFound", area));

      const data = response[0];
      areaKey = data.Key;
      areaName = data.LocalizedName;
    } catch (err) {
      return message.reply(getLang("error", err?.response?.data?.Message || err.message));
    }

    try {
      dataWeather = (await axios.get(`https://dataservice.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=bn`)).data;
    } catch (err) {
      return message.reply(getLang("error", err?.response?.data?.Message || err.message));
    }

    const dataWeatherToday = dataWeather.DailyForecasts[0];
    const msg = getLang("today",
      areaName,
      dataWeather.Headline.Text,
      convertFtoC(dataWeatherToday.Temperature.Minimum.Value),
      convertFtoC(dataWeatherToday.Temperature.Maximum.Value),
      convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value),
      convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value),
      formatHours(dataWeatherToday.Sun.Rise),
      formatHours(dataWeatherToday.Sun.Set),
      formatHours(dataWeatherToday.Moon.Rise),
      formatHours(dataWeatherToday.Moon.Set),
      dataWeatherToday.Day.LongPhrase,
      dataWeatherToday.Night.LongPhrase
    );

    const bg = await Canvas.loadImage(__dirname + "/assets/image/bgWeather.jpg");
    const canvas = Canvas.createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0);
    let X = 100;
    ctx.fillStyle = "#ffffff";
    const forecastData = dataWeather.DailyForecasts.slice(0, 7);
    for (const item of forecastData) {
      const icon = await Canvas.loadImage(`http://vortex.accuweather.com/adc2010/images/slate/icons/${item.Day.Icon}.svg`);
      ctx.drawImage(icon, X, 210, 80, 80);

      ctx.font = "30px BeVietnamPro-SemiBold";
      ctx.fillText(`${convertFtoC(item.Temperature.Maximum.Value)}°C`, X, 366);

      ctx.font = "30px BeVietnamPro-Regular";
      ctx.fillText(`${convertFtoC(item.Temperature.Minimum.Value)}°C`, X, 445);
      ctx.fillText(moment(item.Date).format("DD"), X + 20, 140);

      X += 135;
    }

    const imagePath = `${__dirname}/tmp/weather_${areaKey}.jpg`;
    fs.writeFileSync(imagePath, canvas.toBuffer());

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, () => fs.unlinkSync(imagePath));
  }
};
