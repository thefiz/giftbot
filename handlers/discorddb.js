const config = require("../config.json");
const fs = require("fs");
const dbMethods = require("./db");
const discordMethods = require("../discordbot");
var methods = {};
var userId = "";
var limit = 2;

methods.addKey = (message, game, key) => {
  return new Promise(function(resolve, reject) {
    var query = { user: message.author.id };
    dbMethods
      .dbFind("114184844191334400", "giftbot", "_users", query)
      .then(function(result) {
        if (result === undefined) {
          methods
            .createUser(message.author)
            .then(function(result) {
              userId = result.insertedId;
              methods
                .addKey2(userId, game, key)
                .then(function(result) {
                  methods
                    .incrementGiven(userId)
                    .then(function() {
                      resolve(result);
                    })
                    .catch(function(err) {
                      reject(err);
                    });
                })
                .catch(function(err) {
                  reject(err);
                });
            })
            .catch(function(err) {
              reject(err);
            });
        } else {
          userId = result._id;
          methods
            .addKey2(userId, game, key)
            .then(function(result) {
              methods
                .incrementGiven(userId)
                .then(function() {
                  resolve(result);
                })
                .catch(function(err) {
                  reject(err);
                });
            })
            .catch(function(err) {
              reject(err);
            });
        }
      });
  });
};

methods.addKey2 = (userId, game, key) => {
  return new Promise(function(resolve, reject) {
    methods
      .counter("keys")
      .then(function(id) {
        var datetime = Date.now();
        var update = {
          _id: id,
          user: userId,
          added: datetime,
          game: game,
          key: key,
          redeemed: false,
          verified: false
        };
        dbMethods.dbInsertOne("114184844191334400", "giftbot", "_keys", update);
        resolve(
          "Successfully added key for **" +
            game +
            "** to list!  Thanks for your contribution!"
        );
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.incrementGiven = userId => {
  return new Promise(function(resolve, reject) {
    var filter = { _id: userId };
    var update = { $inc: { given: 1 } };
    dbMethods.dbUpdateOne(
      "114184844191334400",
      "giftbot",
      "_users",
      filter,
      update
    );
    resolve();
  });
};

methods.incrementRedeemed = userId => {
  return new Promise(function(resolve, reject) {
    var filter = { _id: userId };
    var update = { $inc: { redeemed: 1 } };
    dbMethods.dbUpdateOne(
      "114184844191334400",
      "giftbot",
      "_users",
      filter,
      update
    );
    resolve();
  });
};

methods.list = () => {
  var gamelist = "";
  return new Promise(function(resolve, reject) {
    var query = { redeemed: false };
    dbMethods
      .dbFindMany("114184844191334400", "giftbot", "_keys", query)
      .then(function(result) {
        for (let value of result)
          gamelist = gamelist.concat(value._id + ": " + value.game + "\r\n");
        fs.writeFile("GiftmasList.txt", gamelist, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.redeemKey = (user, id) => {
  return new Promise(function(resolve, reject) {
    id = parseInt(id);
    var query = { _id: id };
    dbMethods
      .dbFind("114184844191334400", "giftbot", "_keys", query)
      .then(function(result) {
        if (result !== undefined) {
          if (result.redeemed) {
            resolve("Key already redeemed");
          } else {
            methods
              .checkLimit(user)
              .then(function(allowed) {
                if (allowed) {
                  methods
                    .checkOwner(user, id)
                    .then(function(owner) {
                      if (owner) {
                        methods
                          .removeKey(id)
                          .then(function() {
                            methods
                              .decrementGiven(user)
                              .then(function() {
                                resolve(
                                  "You submitted this key, redeeming it has removed it from the database.  This does not count against your allowance.\n" +
                                    result.game +
                                    ": " +
                                    result.key
                                );
                              })
                              .catch(function(err) {
                                reject(err);
                              });
                          })
                          .catch(function(err) {
                            reject(err);
                          });
                      } else {
                        methods
                          .claimKey(id, user)
                          .then(function() {
                            methods
                              .getUser(user)
                              .then(function(userDb) {
                                methods
                                  .incrementRedeemed(userDb._id)
                                  .then(function() {
                                    resolve(
                                      "Merry Holiday!!!\n" +
                                        result.game +
                                        ": " +
                                        result.key
                                    );
                                  })
                                  .catch(function(err) {
                                    reject(err);
                                  });
                              })
                              .catch(function(err) {
                                reject(err);
                              });
                          })
                          .catch(function(err) {
                            reject(err);
                          });
                      }
                    })
                    .catch(function(err) {
                      reject(err);
                    });
                } else {
                  resolve(
                    "You have reached your redemption limit. This could be because you didn't verify your last key received was working, or you received too many keys.  Providing verified keys increases your limit.  The limit may also increase at a later date."
                  );
                }
              })
              .catch(function(err) {
                reject(err);
              });
          }
        } else {
          resolve("Invalid ID#");
        }
      });
  });
};

methods.checkLimit = user => {
  return new Promise(function(resolve, reject) {
    methods.getUser(user).then(function(result) {
      if (result.redeemed > result.verified) {
        resolve(false);
      } else {
        let userLimit = limit + result.bonus;
        if (result.redeemed >= userLimit) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
};

methods.needVerify = user => {
  return new Promise(function(resolve, reject) {
    methods
      .getUser(user)
      .then(function(result) {
        if (result.verified < result.redeemed) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.verify = user => {
  return new Promise(function(resolve, reject) {
    methods
      .getUser(user)
      .then(function(result) {
        var filter = { user: result.user };
        var update = { $inc: { verified: 1 } };
        dbMethods
          .dbUpdateOne(
            "114184844191334400",
            "giftbot",
            "_users",
            filter,
            update
          )
          .then(function() {
            var keyFilter = { _id: result.lastKey };
            var keyUpdate = { $set: { verified: true } };
            dbMethods
              .dbUpdateOne(
                "114184844191334400",
                "giftbot",
                "_keys",
                keyFilter,
                keyUpdate
              )
              .then(function() {
                methods.addBonus(result.lastKey);
                resolve();
              });
          })
          .catch(function(err) {
            reject(err);
          });
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.addBonus = key => {
  return new Promise(function(resolve, reject) {
    var query = { _id: key };
    dbMethods
      .dbFind("114184844191334400", "giftbot", "_keys", query)
      .then(function(result) {
        var userFilter = { _id: result.user };
        var userUpdate = { $inc: { bonus: 1 } };
        dbMethods
          .dbUpdateOne(
            "114184844191334400",
            "giftbot",
            "_users",
            userFilter,
            userUpdate
          )
          .then(function(result) {
            resolve(result);
          })
          .catch(function(err) {
            reject(err);
          });
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.getUser = user => {
  return new Promise(function(resolve, reject) {
    var query = { user: user.id };
    dbMethods
      .dbFind("114184844191334400", "giftbot", "_users", query)
      .then(function(result) {
        if (result === undefined) {
          methods.createUser(user).then(function() {
            methods.getUser(user);
          });
        } else {
          resolve(result);
        }
      });
  });
};

methods.checkOwner = (user, id) => {
  return new Promise(function(resolve, reject) {
    methods.getUser(user).then(function(result) {
      var query = { _id: id, user: result._id };
      dbMethods
        .dbFind("114184844191334400", "giftbot", "_keys", query)
        .then(function(result) {
          if (result === undefined) {
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch(function(err) {
          reject(err);
        });
    });
  });
};

methods.createUser = user => {
  return new Promise(function(resolve, reject) {
    var update = {
      user: user.id,
      given: 0,
      redeemed: 0,
      verified: 0,
      bonus: 0
    };
    dbMethods
      .dbInsertOne("114184844191334400", "giftbot", "_users", update)
      .then(function(result) {
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.removeKey = id => {
  return new Promise(function(resolve, reject) {
    var filter = { _id: id };
    dbMethods
      .dbDeleteOne("114184844191334400", "giftbot", "_keys", filter)
      .then(function(result) {
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.decrementGiven = user => {
  return new Promise(function(resolve, reject) {
    var filter = { user: user.id };
    var update = { $inc: { given: -1 } };
    dbMethods.dbUpdateOne(
      "114184844191334400",
      "giftbot",
      "_users",
      filter,
      update
    );
    resolve();
  });
};

methods.claimKey = (id, user) => {
  return new Promise(function(resolve, reject) {
    var filter = { _id: id };
    var update = { $set: { redeemed: true, redeemer: user.id } };
    dbMethods
      .dbUpdateOne("114184844191334400", "giftbot", "_keys", filter, update)
      .then(function(result) {
        var userFilter = { user: user.id };
        var userUpdate = { $set: { lastKey: id } };
        dbMethods
          .dbUpdateOne(
            "114184844191334400",
            "giftbot",
            "_users",
            userFilter,
            userUpdate
          )
          .then(function(result) {
            resolve(result);
          })
          .catch(function(err) {
            reject(err);
          });
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.counter = name => {
  return new Promise(function(resolve, reject) {
    var query = { _id: name };
    var update = { $inc: { next: 1 } };
    dbMethods
      .dbFind("114184844191334400", "giftbot", "_counters", query)
      .then(function(result) {
        dbMethods.dbUpdateOne(
          "114184844191334400",
          "giftbot",
          "_counters",
          query,
          update
        );
        resolve(result.next);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

module.exports = methods;
