const discordDb = require("../handlers/discorddb");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    if (message.channel.type !== "dm") {
      message.delete().then(function() {
        message.channel.send("please DM your keys to Gift Bot");
      });
      reject("DM Only");
    } else {
      const fullString = args.join(" ");
      var target = [].concat
        .apply(
          [],
          fullString.split('"').map(function(v, i) {
            return i % 2 ? v : v.split(" ");
          })
        )
        .filter(Boolean);
      if (target.length > 2) {
        target = [].concat(args.join(" "));
      }
      if (target[0] == undefined || target[1] == undefined) {
        message.author.send(
          'Incorrect format, please use **!give "key" "game"**'
        );
        reject("Incorrect Format");
      } else {
        discordDb.addKey(message, target[1], target[0]).then(function(result) {
          message.author.send(result);
        });
      }
    }
  });
};
