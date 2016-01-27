var irc = require('tmi.js');
var chalk = require('chalk');

var config = require('./config');

var optionsChat = {
  options: {
    debug: false
  },
  connection: {
    random: 'chat',
    reconnect: true
  },
  identity: {
    username: config.twitch.user,
    password: config.twitch.oauth
  },
  channels: ['#bot_cobalt']
};

var optionsWhisper = {
  options: {
    debug: false
  },
  connection: {
    random: 'group',
    reconnect: true
  },
  identity: {
    username: config.twitch.user,
    password: config.twitch.oauth
  },
  channels: ['#bot_cobalt']
};

var clientChat = new irc.client(optionsChat);
var clientWhisper = new irc.client(optionsWhisper);

var betCount = 0;

var placeBet = function() {
  if (betCount === 0) {
    setTimeout(getVolts, 1000 + (Math.random() * 4000));
  }

  console.log(chalk.blue('Placing bet...'));
  clientWhisper.whisper('bot_cobalt', '!b c 20%');

  betCount++;

  if (betCount > 3) {
    betCount = 0;
  }
};

var getVolts = function() {
  console.log(chalk.green('Requesting volts...'));
  clientWhisper.whisper('bot_cobalt', '!v');
};

// Connect the client to the server..
clientWhisper.connect().then(function() {
  return clientChat.connect();
});

// Example of action messages from bot_cobalt
//
// Round 5 resolved! Winning bets: blue, combo
// Round 6 is about to begin! Place your bets! Odds: Red:3.00 Blue:1.48 Multi:37.82 Ace:51.15 Whole:10.75 Combo:1.63

var regexRound = /(.*)winning bets(.*)/i;
var regexBets = /(.*)place your bets(.*)/i;
var regexVolts = /rawkes:(\d*)/i;

clientChat.on('action', function (channel, user, message, self) {
  if (!user || user.username != 'bot_cobalt') {
    return;
  }

  if (regexRound.exec(message)) {
    console.log(chalk.gray.bgYellow(message));
  }

  if (regexBets.exec(message)) {
    console.log(chalk.gray.bgYellow(message));
    console.log(chalk.blue('Placing bet after cooldown period...'));
    setTimeout(placeBet, 5000 + (Math.random() * 5000));
  }

  if (message.startsWith('Volts:')) {
    var results = regexVolts.exec(message);

    if (results) {
      console.log(chalk.green('Volts: ' + results[1]));
    }
  };
});

clientWhisper.on('whisper', function (username, message) {
  if (username != 'bot_cobalt') {
    return;
  }

  console.log(chalk.red(message));
});
