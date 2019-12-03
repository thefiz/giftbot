const discordDb = require("../handlers/discorddb");
const Discord = require("discord.js");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    if (message.author.id == "53295802654658560") {
      message.author.send(
        "Please type **yes** to acknowledge that you wish to reset the user list to default settings"
      );
      const filter = m => m.author.id === message.author.id;
      const collector = new Discord.MessageCollector(message.channel, filter, {
        time: 60000,
        maxMatches: 1
      });
      collector.on("collect", m => {
        if ((m.content = "yes")) {
          discordDb.resetUsers().then(function() {
            message.author.send("Successfully reset user list");
            resolve();
          });
        }
      });
    } else {
      reject("Not authorized");
    }
  });
};
