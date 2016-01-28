// Team betting should take into account what the system wants to do and
// compare it against actual win/loss trends. Basically, it should change its
// approach if it's clearly not working!
//
// For example, the current system always bets for the team with the highest
// odds because often this is the winning team for some reason. Of course, this
// isn't always the case and the other team will always win instead, yet we
// continue to bet on the wrong team, even though it's pretty obvious the other
// team has some kind of advantage right now.
//
// Be aware that I have noticed that over time, the dumb betting approach seems
// to average out and result in quite subtantial wins due to upsets. Often I see
// all the human players making an incorrect bet with my bot being the only one
// making the correct one – enough of these add up to subtantial profits. Even
// the losses aren't that bad as they're usually offset by combo wins.
//
// In short, picking a team to bet on is incredibly dumb and naive right now.
// It would be good to do something more advanced that takes into consideration
// things like recent w/l ratios, success of our previous bets, etc.
//
// A very simple approach may be to just reverse the betting approach if 2 or
// more games in a row aren't successful bets, or override the bet and go with
// the team which has won the most rounds during the current match.
//
// Theoretically, as more rounds go by we should be able to refine and dial in
// the betting approach to ultimately avoid making predictable mistakes.
//
// Topics: genetic algorithms, probability, machine learning, prediction

// TODO: Store a log of all match results for a day and use it to run betting
// experiments on to immediately test varying approaches and their outcomes.
// TODO: Log success or failure of last bet after each round
// TODO: Keep track of bet success for all bets in the current match
// TODO: After each round log success % for all bets in the current match
// TODO: Track bet success trend after each round (getting better or worse?)
// TODO: Request volts after the end of each match
// TODO: Track volts % improvement and trend after each match
// TODO: Get volts count after each round by whispering !b b

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

var parseOdds = function(oddsStr) {
  var results = oddsStr.match(/Red:(\d*.\d*)|Blue:(\d*.\d*)|Purple:(\d*.\d*)|Green:(\d*.\d*)|Multi:(\d*.\d*)|Ace:(\d*.\d*)|Whole:(\d*.\d*)|Combo:(\d*.\d*)/gi);

  var odds = {};
  var oddSplit;
  results.forEach(function(odd) {
    oddSplit = odd.split(':');
    odds[oddSplit[0].toLowerCase()] = Number(oddSplit[1]);
  });

  return odds;
};

var placeBets = function(oddsStr) {
  if (betCount === 0) {
    setTimeout(getVolts, 1000 + (Math.random() * 4000));
  }

  var odds = parseOdds(oddsStr);

  console.log(chalk.blue('Placing bets...'));

  console.log(chalk.gray.bgBlue('Betting multi 1%'));
  clientWhisper.whisper('bot_cobalt', '!b m 1%');

  setTimeout(function() {
    console.log(chalk.gray.bgBlue('Betting ace 1%'));
    clientWhisper.whisper('bot_cobalt', '!b a 1%');
  }, 1000);

  setTimeout(function() {
    console.log(chalk.gray.bgBlue('Betting whole 1%'));
    return clientWhisper.whisper('bot_cobalt', '!b w 1%');
  }, 2000);

  setTimeout(function() {
    console.log(chalk.gray.bgBlue('Betting combo 5%'));
    return clientWhisper.whisper('bot_cobalt', '!b c 5%');
  }, 3000);

  var oddsByTeam = [];

  if (odds.red) {
    oddsByTeam.push([odds.red, 'r', 'red']);
  }

  if (odds.blue) {
    oddsByTeam.push([odds.blue, 'b', 'blue']);
  }

  if (odds.purple) {
    oddsByTeam.push([odds.purple, 'p', 'purple']);
  }

  if (odds.green) {
    oddsByTeam.push([odds.green, 'g', 'green']);
  }

  // Sort teams by odds
  oddsByTeam.sort(function(a, b) {
    if (a[0] < b[0]) {
      return -1;
    }

    if (a[0] > b[0]) {
      return 1;
    }

    return 0;
  });

  // Bet on team with worse odds, because why not
  setTimeout(function() {
    console.log(chalk.gray.bgBlue('Betting ' + oddsByTeam[1][2] + ' 10%'));
    clientWhisper.whisper('bot_cobalt', '!b ' + oddsByTeam[1][1] + ' 10%');
  }, 4000);

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

// Docs on how the game works
// http://pastebin.com/V0phNPRU

// Example of action messages from bot_cobalt
//
// Round 5 resolved! Winning bets: blue, combo
// Round 6 is about to begin! Place your bets! Odds: Red:3.00 Blue:1.48 Multi:37.82 Ace:51.15 Whole:10.75 Combo:1.63
// Round 21 starting! No more bets! Total Bets: 37 , Total volts: 203781
// Participation Bonus: Match Over +100 to all viewers!
// Volts: rocketscientists:76263, grum_:101, iscre4m:113384, shoghicp:8470, profmobius:187446

var regexRound = /.*winning bets.*/i;
var regexMatch = /.*match over.*/i;
var regexBets = /.*place your bets\! (.*)/i;
var regexVolts = new RegExp(config.twitch.user + ':(\\d*)', 'i');

clientChat.on('action', function (channel, user, message, self) {
  if (!user || user.username != 'bot_cobalt') {
    return;
  }

  if (regexRound.exec(message)) {
    console.log(chalk.gray.bgYellow(message));
  }

  if (regexMatch.exec(message)) {
    console.log(chalk.gray.bgRed(message));
  }

  var odds = regexBets.exec(message);
  if (odds) {
    console.log(chalk.gray.bgYellow(message));
    console.log(chalk.blue('Placing bets after cooldown period...'));
    setTimeout(function() {
      placeBets(odds[1]);
    }, 5000 + (Math.random() * 5000));
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
