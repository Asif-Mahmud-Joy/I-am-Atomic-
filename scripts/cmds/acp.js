const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "2.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 8,
    role: 2,
    shortDescription: "Accept or delete friend requests",
    longDescription: "Accept/delete friend requests using FB GraphQL",
    category: "Utility",
  },

  onReply: async function ({ message, Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.trim().split(/ +/g);
    const action = args[0]?.toLowerCase();
    const targets = args.slice(1);

    if (!['add', 'del'].includes(action))
      return message.reply("❌ | Use: add/del [index|all]");

    clearTimeout(Reply.unsendTimeout);

    const formBase = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.random().toString(36).substring(7),
        },
        scale: 3,
        refresh_num: 0
      }
    };

    if (action === "add") {
      formBase.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    } else {
      formBase.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
    }

    const ids = targets[0] === "all" ? listRequest.map((_, i) => i + 1) : targets.map(Number);
    const successes = [], failures = [];

    for (const index of ids) {
      const user = listRequest[index - 1];
      if (!user) {
        failures.push(`❌ Invalid index: ${index}`);
        continue;
      }

      const form = JSON.parse(JSON.stringify(formBase));
      form.variables.input.friend_requester_id = user.node.id;
      form.variables = JSON.stringify(form.variables);

      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const json = JSON.parse(res);
        if (json.errors) {
          failures.push(`⚠️ ${user.node.name}`);
        } else {
          successes.push(`✅ ${user.node.name}`);
        }
      } catch (e) {
        failures.push(`❌ ${user.node.name}`);
      }
    }

    let msg = `${action === "add" ? "✅ Friend request accepted" : "🗑️ Friend request deleted"} for ${successes.length} user(s):\n${successes.join("\n")}`;
    if (failures.length)
      msg += `\n\n❌ Failed to process ${failures.length} user(s):\n${failures.join("\n")}`;

    message.reply(msg);
    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
    const listRequest = JSON.parse(res).data.viewer.friending_possibilities.edges;

    if (!listRequest.length)
      return api.sendMessage("📭 No friend requests found.", event.threadID);

    let msg = "👥 Friend Requests List:\n";
    listRequest.forEach((user, i) => {
      msg += `\n${i + 1}. Name: ${user.node.name}`;
      msg += `\nID: ${user.node.id}`;
      msg += `\nURL: ${user.node.url.replace("www.facebook", "fb")}`;
      msg += `\nTime: ${moment(user.time * 1000).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n`;
    });

    api.sendMessage(
      `${msg}\n\n✏️ Reply with: add|del [number|all]`,
      event.threadID,
      (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => api.unsendMessage(info.messageID), 180000)
        });
      },
      event.messageID
    );
  }
};
