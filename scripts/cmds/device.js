const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "device",
    aliases: ["android"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Device specs dekhao",
    longDescription: "Android ba onno kono phone er details dekhte parbe",
    category: "phones",
    guide: "{pn} <device name>"
  },

  onStart: async function ({ message, args }) {
    const name = args.join(" ");
    if (!name)
      return message.reply(`⚠️ Device er naam dao!");

    const BASE_URL = `https://api.jastin.xyz/gsmarena/device?query=${encodeURIComponent(name)}`;

    try {
      const res = await axios.get(BASE_URL);
      const data = res.data.data;

      if (!data || typeof data !== "object")
        return message.reply("🥺 Device khuja pawa jai nai bro");

      const {
        name: nam, brand, model, price, category: ctgry, network_type: ntr,
        network_2g: ntr2, network_3g: ntr3, network_4g: ntr4, speed,
        gprs, edge, launch_date: lunched, body_dimensions: bodyd,
        body_weight: bodyw, network_sim: ntrs, display_type: dsp,
        display_size: dsps, display_resolution: dspr, display_multitouch: dspm,
        display_density: dspd, display_screen_protection: dspp,
        operating_system: opsys, os_version: osv, user_interface_ui: oem,
        chipset: chip, cpu, gpu, memory_internal: internal, memory_external: external,
        ram, primary_camera: camp, secondary_camera: cams, camera_features: camf,
        video: vdo, audio: aud, loudspeaker: lspkr, m_jack: jack, wifi, bluetooth: bt,
        nfc, infrared, usb, gps, fm_radio: fm, sensors: sensor, messaging: msg,
        battery_type: btryt, battery_capacity: btryc, charging: crg, body_color: color,
        image: img
      } = data;

      const form = {
        body: `📱 Device Info for "${nam}"

🔹 Brand: ${brand}
🔹 Model: ${model}
🔹 Price: ${price}
🔹 Category: ${ctgry}
🔹 Released: ${lunched}
🔹 Color: ${color}

📶 Network
- Type: ${ntr}
- 2G: ${ntr2}
- 3G: ${ntr3}
- 4G: ${ntr4}
- Speed: ${speed}
- GPRS: ${gprs} | EDGE: ${edge}

📏 Body
- Dimensions: ${bodyd}
- Weight: ${bodyw}
- SIM: ${ntrs}

📺 Display
- Type: ${dsp}
- Size: ${dsps}
- Resolution: ${dspr}
- Multitouch: ${dspm}
- Density: ${dspd}
- Protection: ${dspp}

⚙️ Platform
- OS: ${opsys} ${osv}
- UI: ${oem}
- Chipset: ${chip}
- CPU: ${cpu}
- GPU: ${gpu}

💾 Memory
- Internal: ${internal}
- External: ${external}
- RAM: ${ram}

📸 Camera
- Primary: ${camp}
- Secondary: ${cams}
- Features: ${camf}
- Video: ${vdo}

🔊 Sound
- Audio: ${aud}
- Loudspeaker: ${lspkr}
- 3.5mm Jack: ${jack}

📡 Connectivity
- Wifi: ${wifi}
- Bluetooth: ${bt}
- NFC: ${nfc} | Infrared: ${infrared}
- USB: ${usb} | GPS: ${gps}

📻 Others
- FM Radio: ${fm}
- Sensors: ${sensor}
- Messaging: ${msg}

🔋 Battery
- Type: ${btryt}
- Capacity: ${btryc}
- Charging: ${crg}`
      };

      if (img) form.attachment = await getStreamFromURL(img);

      message.reply(form);
    } catch (e) {
      console.error(e);
      message.reply(`❌ Device paoa jai nai ba API error hoise.`);
    }
  }
};
