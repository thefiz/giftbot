const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = __dirname;
const dbMethods = require("./handlers/db");

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
  commandFile.run(client, message, args);
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
