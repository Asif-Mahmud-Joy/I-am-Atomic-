async function checkShortCut(nickname, uid, usersData) {
  try {
    if (/\{userName\}/gi.test(nickname)) {
      nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid));
    }
    if (/\{userID\}/gi.test(nickname)) {
      nickname = nickname.replace(/\{userID\}/gi, uid);
    }
    return nickname;
  } catch (e) {
    return nickname;
  }
}

module.exports = {
  config: {
    name: "setname",
    version: "1.4",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Đổi biệt danh",
      en: "Change nickname",
      bn: "নাম পরিবর্তন করুন"
    },
    longDescription: {
      vi: "Đổi biệt danh của thành viên trong nhóm chat",
      en: "Change nickname of members in chat",
      bn: "চ্যাটের সদস্যদের নাম পরিবর্তন করুন"
    },
    category: "box chat",
    guide: {
      vi: {
        body: "   {pn} <nickname>: thay đổi biệt danh của bản thân"
          + "\n   {pn} @tags <nickname>: thay đổi biệt danh của những thành viên được tag"
          + "\n   {pn} all <nickname>: thay đổi biệt danh của tất cả thành viên trong nhóm chat"
          + "\n\n   Với các shortcut có sẵn:"
          + "\n   + {userName}: tên của thành viên"
          + "\n   + {userID}: ID của thành viên",
        attachment: {
          [`${__dirname}/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",
          [`${__dirname}/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"
        }
      },
      en: {
        body: "   {pn} <nickname>: change your nickname"
          + "\n   {pn} @tags <nickname>: change nickname of tagged members"
          + "\n   {pn} all <nickname>: change nickname of all chat members"
          + "\n\nShortcuts:"
          + "\n   + {userName}: member's name"
          + "\n   + {userID}: member's ID",
        attachment: {
          [`${__dirname}/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",
          [`${__dirname}/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"
        }
      },
      bn: {
        body: "   {pn} <nickname>: নিজের নাম পরিবর্তন করুন"
          + "\n   {pn} @tags <nickname>: ট্যাগ করা সদস্যদের নাম পরিবর্তন করুন"
          + "\n   {pn} all <nickname>: সকল সদস্যের নাম পরিবর্তন করুন"
          + "\n\nশর্টকাট ব্যবহার করুন:"
          + "\n   + {userName}: সদস্যের নাম"
          + "\n   + {userID}: সদস্যের আইডি"
      }
    }
  },

  langs: {
    vi: {
      error: "Đã có lỗi xảy ra, thử tắt tính năng liên kết mời trong nhóm và thử lại sau"
    },
    en: {
      error: "An error occurred, try disabling the invite link feature and try again"
    },
    bn: {
      error: "একটি সমস্যা হয়েছে, গ্রুপের ইনভাইট লিংক অপশন বন্ধ করে আবার চেষ্টা করুন"
    }
  },

  onStart: async function ({ args, message, event, api, usersData, getLang }) {
    const mentions = Object.keys(event.mentions);
    let uids = [];
    let nickname = args.join(" ");

    if (args[0] === "all") {
      uids = (await api.getThreadInfo(event.threadID)).participantIDs;
      nickname = args.slice(1).join(" ");
    } else if (mentions.length > 0) {
      uids = mentions;
      const mentionedNames = Object.values(event.mentions).join("|");
      nickname = nickname.replace(new RegExp(mentionedNames, "g"), "").trim();
    } else {
      uids = [event.senderID];
      nickname = nickname.trim();
    }

    try {
      for (const uid of uids) {
        const finalName = await checkShortCut(nickname, uid, usersData);
        await api.changeNickname(finalName, event.threadID, uid);
      }
    } catch (e) {
      return message.reply(getLang("error"));
    }
  }
};
