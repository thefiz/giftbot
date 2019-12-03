const discordDb = require("../handlers/discorddb");
const fs = require("fs");

exports.run = (client, message, [...args]) => {
  return new Promise(function(resolve, reject) {
    if (message.channel.type !== "dm") {
      message
        .delete()
        .then(function() {
          message.channel.send("please DM your request to Gift Bot");
        })
        .catch(function() {
          reject("Unable to Delete");
        });
      reject("DM Only");
    } else {
      discordDb.getUser(message.author).then(function(userObject) {
        discordDb.reclaimKeys(userObject._id).then(function(filename) {
          message.author
            .send("Here are the keys you provided which were not redeemed", {
              files: [filename]
            })
            .then(function() {
              fs.unlink(filename, resultHandler);
              client.channels.get("410626695050297355").send(message.author + " just reclaimed all their submitted keys")
            });
        });
      });
    }
  });
};

var resultHandler = function(err) {
  return new Promise(function(resolve, reject) {
    if (err) {
      reject("unlink failed", err);
    } else {
      resolve("file deleted");
    }
  });
};
