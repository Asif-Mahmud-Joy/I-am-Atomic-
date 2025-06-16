// ✅ Final Version of `adduser` Command
// ✅ Fully GoatBot compatible
// ✅ No external APIs required
// ✅ UID fetch and fallback fixed

const sleep = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "adduser",
    version: "2.1-ultramax",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Add member to your group"
    },
    longDescription: {
      en: "Add member to your current group chat using profile link, UID, reply or mention"
    },
    category: "box chat",
    guide: {
      en: "{pn} [profile link | UID | reply | @mention]"
    }
  },

  langs: {
    en: {
      alreadyInGroup: "🔁 Already in group:",
      successAdd: "✅ Successfully added %1 member(s).",
      failedAdd: "❌ Failed to add %1 user(s):",
      approve: "🟡 Waiting approval for %1 user(s):",
      invalidLink: "⚠️ Invalid Facebook link.",
      cannotGetUid: "❌ Couldn't fetch UID.",
      linkNotExist: "🚫 Profile not found.",
      cannotAddUser: "⛔ Bot blocked or user restricts group adds."
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    const success = { normal: [], approval: [] };
    const failed = [];

    const resolveUid = async (input) => {
      if (!isNaN(input)) return input;
      if (/facebook\.com\//.test(input)) {
        try {
          const res = await api.getUID(input);
          if (res) return res;
          throw new Error(getLang("linkNotExist"));
        } catch (e) {
          throw new Error(getLang("cannotGetUid"));
        }
      }
      throw new Error(getLang("invalidLink"));
    };

    const inputs = event.mentions && Object.keys(event.mentions).length > 0
      ? Object.keys(event.mentions)
      : args.length > 0
        ? args
        : event.messageReply
          ? [event.messageReply.senderID]
          : [];

    for (const input of inputs) {
      try {
        const uid = await resolveUid(input);
        const inGroup = members.find(m => m.userID == uid)?.inGroup;

        if (inGroup) {
          failed.push(`${getLang("alreadyInGroup")} ${uid}`);
          continue;
        }

        await api.addUserToGroup(uid, event.threadID);
        (approvalMode && !adminIDs.includes(botID) ? success.approval : success.normal).push(uid);
      } catch (err) {
        failed.push(`${input}: ${err.message}`);
      }
      await sleep(1000);
    }

    let msg = "";
    if (success.normal.length) msg += getLang("successAdd", success.normal.length) + "\n";
    if (success.approval.length) msg += getLang("approve", success.approval.length) + "\n";
    if (failed.length) msg += getLang("failedAdd", failed.length) + "\n" + failed.map(f => `• ${f}`).join("\n");

    return message.reply(msg.trim());
  }
};
