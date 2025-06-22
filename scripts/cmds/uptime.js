const os = require('os');
const pidusage = require('pidusage');
const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "status"],
    version: "3.0",
    author: "Eren & Asif",
    role: 0,
    description: {
      en: "✨ View comprehensive system and bot statistics ✨"
    },
    category: "info",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  📊 SYSTEM STATUS COMMAND 📊
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} - View detailed system stats

💎 Features:
✦ Bot & system uptime
✦ CPU & memory usage
✦ Disk space
✦ User & group counts
✦ Network status
✦ Package dependencies
      `
    }
  },

  onStart: async function ({ message, usersData, threadsData }) {
    try {
      // Get current time in Asia/Dhaka timezone
      const now = moment().tz('Asia/Dhaka');
      const formatDate = now.format('YYYY-MM-DD HH:mm:ss');

      // Uptime calculations
      const uptimeBot = process.uptime();
      const uptimeSys = os.uptime();
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
      };

      // System resource usage
      const usage = await pidusage(process.pid);
      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedRam = (usage.memory / 1024 / 1024).toFixed(2);
      const cpuUsage = usage.cpu.toFixed(1);
      const cpuModel = os.cpus()[0].model.split('@')[0].trim();
      const cpuCores = os.cpus().length;
      const cpuSpeed = (os.cpus()[0].speed / 1000).toFixed(2);

      // Package count
      const pkgCount = Object.keys(require('../../package.json').dependencies || {}).length;

      // User and thread data
      const [users, threads] = await Promise.all([
        usersData.getAll(),
        threadsData.getAll()
      ]);

      // Disk space (using execSync for cross-platform compatibility)
      let diskInfo = "N/A";
      try {
        if (process.platform === 'win32') {
          diskInfo = require('child_process').execSync('wmic logicaldisk get size,freespace,caption').toString();
        } else {
          diskInfo = require('child_process').execSync('df -h').toString();
        }
      } catch (e) {
        console.error("Disk info error:", e);
      }

      // Network interfaces
      const networkInfo = Object.entries(os.networkInterfaces())
        .map(([name, details]) => `${name}: ${details.find(i => i.family === 'IPv4')?.address || 'N/A'}`)
        .join('\n');

      // Prepare the status message
      const statusMessage = `
╔═══════❖•°♛°•❖═══════╗
  🚀 BOT & SYSTEM STATUS
╚═══════❖•°♛°•❖═══════╝

📅 Current Time: ${formatDate} (GMT+6)

⏱️ Uptime:
├ Bot: ${formatUptime(uptimeBot)}
└ System: ${formatUptime(uptimeSys)}

💻 CPU:
├ Model: ${cpuModel}
├ Cores: ${cpuCores}
├ Speed: ${cpuSpeed} GHz
└ Usage: ${cpuUsage}%

🧠 Memory:
├ Total: ${totalRam} GB
├ Used: ${usedRam} MB
└ Free: ${freeRam} GB

📊 Stats:
├ Packages: ${pkgCount}
├ Users: ${users.length}
└ Groups: ${threads.length}

🌐 Network:
${networkInfo.split('\n').map(line => `├ ${line}`).join('\n')}

💾 Disk:
${diskInfo.split('\n').slice(0, 5).join('\n')}
      `;

      await message.reply(statusMessage);
    } catch (err) {
      console.error("[UPTIME ERROR]", err);
      await message.reply("❌ An error occurred while fetching system status. Please try again later.");
    }
  }
};
