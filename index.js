const { TelegramClient } = require('telegram');
const { StoreSession } = require('telegram/sessions/index.js');
module.exports = class Telegram {

  session = new StoreSession('ninjakatt-telegram-session');
  constructor() {
    this.construct(__dirname);
    this.tmdb = null;
  }

  setup() {
    this.logDebug('Setting up telegram plugin');

    console.log(this.settings);
    if (Object.values(this.settings).some((s) => s.length === 0)) {
      return this.logError('Missing settings');
    }

    this.getTelegramClient().then((client) => {
      this.gram = client;
    });
  }

  subscriptions() {
    this.subscribe('telegram.send-message', this.actOnPostMessage);
  }

  routes() {
    this.route('post', '', this.postMessage);
  }

  /********* Route Functions *********/
  postMessage = (req, res) => {
    const messageContent = req.body.message;
    if (!messageContent) {
      return res.status(400).send();
    }
    this.actOnPostMessage(messageContent);
    return res.status(200).send('ok');
  };


  /********* Event Functions *********/
  actOnPostMessage = async (message) => {
    this.logInfo('Sending message');
    await this.gram.sendMessage(this.settings.CHANNEL_ID, { message });
    this.emit('telegram.sent-message', message);
  };


  /********* Plugin Functions *********/
  getTelegramClient = async () => {
    const client = new TelegramClient(this.session, this.settings.API_ID, this.settings.APP_HASH, { connectionRetries: 5 })
    await client.start({
        botAuthToken: this.settings.BOT_TOKEN,
        onError: (err) => console.log(err),
    });
    this.logDebug('Telegram client started');
    return client;
  }

};
