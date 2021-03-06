exports.run = (client, message, args) => {
  return new Promise(function(resolve, reject) {
    if (message.guild !== null) {
      message.delete();
    }
    message.author
      .send(
        "Giftmas Commands:\n\n" +
          "**!help**: This help screen (duh)\n" +
          '**!give "key" "title"**: adds a key to the giving database (both key and title are required, and should be in seperate quotation marks.  If you are giving on a platform other than Steam, please include that in the game name\n' +
          "**!list**: Receive a list of all keys available\n" +
          "**!receive #**: Receive specified key (if you were the one who added it, it removes it from the list)\n" +
          "**!reclaim**: Reclaim all of your keys which you have supplied which have not been redeemed\n" +
          "**!verify**: Verifies that the last key you received works, necessary to receive more keys.  If a key does not work, please reach out to Fiz\n\n" +
          "Note: There is a limit on the number of games one can receive.  That limit will be evaluated over time and may change..\n\n" +
          "Also, please note that a lot of keys are left over from previous years.  Please reach out to Fiz if any keys do not work."
      )
      .catch(error =>
        reject(
          'Unable to send DM.  You likely do not have DMs from server members enabled on Discord.  Right click the server icon, and choose "Privacy Settings" to turn it on'
        )
      );
  });
};
