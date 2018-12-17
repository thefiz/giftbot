const discordDb = require("../handlers/discorddb");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    //check if user is subbed to the channel
    var guild = client.guilds.get("114184844191334400");
    var member = guild.members.get(message.author.id);
    let subRole = guild.roles.find(role => role.name === "illuminati");
    if (member.roles.has(subRole.id)) {
      //user is subbed to the channel
      if (args[0] === undefined) {
        message.author.send(
          "Please indicate the # of the game you wish to redeem"
        );
        resolve();
      } else {
        discordDb.redeemKey(message.author, args[0]).then(function(result) {
          message.author.send(result);
        });
      }
    } else {
      //user is not subbed to the channel
      message.author.send(
        "You are not subscribed to SkinnedTeen on Twitch (or you haven't linked your Discord and Twitch accounts) and cannot use this command"
      );
      resolve();
    }
  });
};
