var config = require("../config.json");
const MongoClient = require("mongodb").MongoClient;
const uri = config.bot.mongouri;
var methods = {};

methods.dbSetup = (type, dbId, collections) => {
  return new Promise(function(resolve, reject) {
    methods
      .dbConnect()
      .then(function(db) {
        let dbo = db.db(type);
        var i;
        for (i = 0; i < collections.length; i++) {
          dbo.createCollection(dbId + collections[i], function(err, res) {
            if (err) {
              reject(err);
            } else {
              // console.log(res);
            }
          });
          if (i == collections.length - 1) {
            setTimeout(function() {
              methods.dbClose(db);
            }, 1000);
          }
        }
        resolve(db);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

methods.dbClose = db => {
  db.close();
};

methods.dbReset = (type, dbId, collections) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      var i;
      for (i = 0; i < collections.length; i++) {
        dbo.collection(dbId + collections[i]).drop(function(err, res) {
          if (err) reject(err);
          db.close();
        });
      }
      db.close();
      resolve();
    });
  });
};

methods.dbConnect = () => {
  return new Promise(function(resolve, reject) {
    var options = {
      keepAlive: 1,
      connectTimeoutMS: 30000,
      useNewUrlParser: true
    };
    MongoClient.connect(
      uri,
      options,
      function(err, db) {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
  });
};

methods.dbFindMany = (dbId, type, collection, query) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      dbo
        .collection(dbId + collection)
        .find(query)
        .toArray(function(err, result) {
          if (err) reject(err);
          resolve(result);
        });
      db.close();
    });
  });
};

methods.dbFind = (dbId, type, collection, query) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      dbo
        .collection(dbId + collection)
        .find(query)
        .toArray(function(err, result) {
          if (err) reject(err);
          resolve(result.shift());
        });
      db.close();
    });
  });
};

methods.dbInsertOne = (dbId, type, collection, update) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      dbo
        .collection(dbId + collection)
        .insertOne(update, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      db.close();
    });
  });
};

methods.dbDeleteOne = (dbId, type, collection, filter) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      dbo
        .collection(dbId + collection)
        .deleteOne(filter, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      db.close();
    });
  });
};

methods.dbUpdateOne = (dbId, type, collection, filter, update) => {
  return new Promise(function(resolve, reject) {
    methods.dbConnect().then(function(db) {
      let dbo = db.db(type);
      dbo
        .collection(dbId + collection)
        .updateOne(filter, update, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      db.close();
    });
  });
};

module.exports = methods;
