const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = __dirname;
const dbMethods = require("./handlers/db");
const discordDb = require("./handlers/discorddb");

client.login(config.discord.bot.token);

client.on("ready", () => {
  console.log("Discord Bot Initialized");
  exports.dbInit().catch(function(error) {
    console.log(error);
  });
});

client.on("message", message => {
  if (message.author.bot) return;
  if (
    message.channel.id != "519263263414943782" &&
    message.channel.type !== "dm"
  )
    return;
  if (message.content.indexOf(config.discord.settings.prefix) !== 0) return;
  const args = message.content
    .slice(config.discord.settings.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  exports.checkHardcode(command).then(function(result) {
    if (result) {
      exports.runHardcode(client, message, args, command);
    }
  });
});

client.on("error", error => {
  console.log(error);
});

exports.checkHardcode = command => {
  return new Promise(function(resolve, reject) {
    fs.stat(path + "/commands/" + command + ".js", (err, status) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

exports.runHardcode = (client, message, args, command) => {
  let commandFile = require(`./commands/${command}.js`);
  commandFile
    .run(client, message, args)
    .catch(error => message.channel.send(error));
};

exports.dbInit = function() {
  return new Promise(function(resolve, reject) {
    var collections = ["_keys", "_users", "_counters"];
    for (let value of client.guilds.values()) {
      dbMethods.dbSetup("giftbot", value.id, collections).catch(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  });
};

exports.remindUser = function(userID) {
  return new Promise(function(resolve, reject) {
    client.users
      .get(userID)
      .send(
        "You have not verified the key you received has worked, please take a moment to do so using the **!verify** command.  If I do not hear back from you, I will auto verify it.  \n\nIf the key is not working, please reach out to Fiz ASAP"
      )
      .then(function() {
        client.channels
          .get("410626695050297355")
          .send(
            "<@" +
              userID +
              "> hasn't verified the key they have received, I have sent a reminder"
          );
        resolve();
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

exports.noResponse = function(user) {
  return new Promise(function(resolve, reject) {
    client.users
      .get(userID)
      .send(
        "I still haven't heard from you regarding the key you received.  I have auto verified it as working.  If it does not work, please reach out to Fiz"
      )
      .then(function() {
        client.channels
          .get("410626695050297355")
          .send(
            "<@" +
              userID +
              "> hasn't responded to the verification reminder, I have auto verified the key"
          );
        resolve();
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

exports.verifyTimer = function() {
  return new Promise(function(resolve, reject) {
    discordDb
      .verifyCheck()
      .then(function(result) {
        if ((result = "Success")) {
          resolve();
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

setInterval(exports.verifyTimer, 3600000);
