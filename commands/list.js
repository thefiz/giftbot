const discordDb = require("../handlers/discorddb");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    discordDb.list().then(function() {
      message.author.send("Here's the available keys", {
        files: ["./GiftmasList.txt"]
      });
    });
  });
};
