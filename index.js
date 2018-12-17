const config = require("./config.json")
require("./discordbot")

process.title = "GiftBot v" + config.bot.version

process.on('SIGTERM', () => {
    console.info("SIGTERM signal received.")
    process.exit(0)
})