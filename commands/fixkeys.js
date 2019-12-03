const discordDb = require("../handlers/discorddb");
const Discord = require("discord.js");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    if (message.author.id == "53295802654658560") {
      message.author.send(
        "Please type **yes** to acknowledge that you wish to fix the keys"
      );
      const filter = m => m.author.id === message.author.id;
      const collector = new Discord.MessageCollector(message.channel, filter, {
        time: 60000,
        maxMatches: 1
      });
      collector.on("collect", m => {
        if ((m.content = "yes")) {
          discordDb.fixKeys().then(function() {
            message.author.send("Successfully fixed keys");
            resolve();
          });
        }
      });
    } else {
      reject("Not authorized");
    }
  });
};
