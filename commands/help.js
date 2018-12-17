exports.run = (client, message, args) => {
  message.author.send(
    "Giftmas Commands:\n\n" +
      "**!help**: This help screen (duh)\n" +
      '**!give "key" "game"**: adds a key to the giving database (both key and game are required, and should be in seperate quotes.  If you are giving on a platform other than Steam, please include that in the game name\n' +
      "**!list**: list all games available\n" +
      "**!receive #**: Receive specified game\n" +
      "**!remove #**: Removes specified game from the giving list, can only be done by the person who added it (if you no longer want to give it away)\n\n" +
      "Note: There is a limit on the number of games one can receive.  That limit will be evaluated over time and may change.\n\n" +
      "If there are any issues with keys you received not working, please message Fiz."
  );
};
