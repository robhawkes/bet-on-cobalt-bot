#!/usr/bin/env node

var readline = require('readline');
var fs = require('fs');

if (!process.argv[2]) {
  console.log('Log file path required');
  process.exit();
}

process.stdin.setEncoding('utf8');

var rl = readline.createInterface({
  input: fs.createReadStream(process.argv[2]),
});

var regexRound = /.*winning bets: (.*)/i;
var regexMatch = /.*match over.*/i;
var regexBets = /.*place your bets\! (.*)/i;

var rounds = [];
var currentRound = [];

// Example of action messages from bot_cobalt
//
// Round 5 resolved! Winning bets: blue, combo
// Round 6 is about to begin! Place your bets! Odds: Red:3.00 Blue:1.48 Multi:37.82 Ace:51.15 Whole:10.75 Combo:1.63
// Round 21 starting! No more bets! Total Bets: 37 , Total volts: 203781
// Participation Bonus: Match Over +100 to all viewers!

var parseLine = function(line) {
  var betResults = regexBets.exec(line);
  if (betResults) {
    currentRound = [];

    var odds = parseOdds(betResults[1]);
    currentRound[0] = odds;
    return;
  }

  var roundResults = regexRound.exec(line);
  if (roundResults) {
    if (!currentRound[0]) {
      return;
    }

    var winners = parseWinners(roundResults[1]);
    currentRound[1] = winners;
    rounds.push(currentRound);
    return;
  }
};

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

var parseWinners = function(winnersStr) {
  return winnersStr.split(', ');
};

rl.on('line', (line) => {
  parseLine(line);
}).on('close', () => {
  console.log(JSON.stringify(rounds, null, 2));

  // var distribution = {
  //   multi: 0,
  //   ace: 0,
  //   whole: 0,
  //   combo: 0,
  //   red: 0,
  //   blue: 0,
  //   purple: 0,
  //   green: 0
  // };
  //
  // console.log(rounds.length);
  //
  // rounds.forEach((round) => {
  //   round[1].forEach((result) => {
  //     if (distribution[result] !== undefined) {
  //       distribution[result]++;
  //     }
  //   });
  // });
  //
  // console.log(distribution);

  process.exit();
});
