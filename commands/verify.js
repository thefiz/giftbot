const Discord = require("discord.js");
const discordDb = require("../handlers/discorddb");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    discordDb.needVerify(message.author).then(function(needed) {
      if (needed) {
        message.author.send(
          "Please type **yes** to acknowledge that you have redeemed the last key you received successfully"
        );
        const filter = m => m.author.id === message.author.id;
        const collector = new Discord.MessageCollector(
          message.channel,
          filter,
          {
            time: 60000,
            maxMatches: 1
          }
        );
        collector.on("collect", m => {
          if ((m.content = "yes")) {
            discordDb.verify(message.author).then(function() {
              message.author.send("Successfully verified key");
              resolve();
            });
          }
        });
        collector.on("end", collected => {
          if (collected.size === 0) {
            message.author.send("Verification Timed Out, please try again.");
          }
        });
      } else {
        message.author.send("You have nothing to verify");
      }
    });
  });
};
