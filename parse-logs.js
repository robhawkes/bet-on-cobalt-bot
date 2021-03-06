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

  // var totalRedBlueRounds = 0;
  // var totalPurpleGreenRounds = 0;
  //
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
  //   var roundSet = false;
  //
  //   round[1].forEach((result) => {
  //     if (distribution[result] !== undefined) {
  //       if (!roundSet) {
  //         if (result == 'red' || result == 'blue') {
  //           totalRedBlueRounds++;
  //           roundSet = true;
  //         } else if (result == 'purple' || result == 'green') {
  //           totalPurpleGreenRounds++;
  //           roundSet = true;
  //         }
  //       }
  //
  //       distribution[result]++;
  //     }
  //   });
  // });
  //
  // console.log(totalRedBlueRounds);
  // console.log(totalPurpleGreenRounds);
  //
  // console.log(distribution);

  // var trustCount = {
  //   yes: 0,
  //   no: 0,
  //   total: 0
  // };
  //
  // var oddsTotals = {
  //   yes: 0,
  //   no: 0
  // };
  //
  // rounds.forEach((round) => {
  //   var trustOdds, odds;
  //
  //   round[1].forEach((result) => {
  //     if (result == 'red' || result == 'blue') {
  //       if (result == 'red') {
  //         trustOdds = (round[0].red < round[0].blue) ? true : false;
  //         odds = round[0].red;
  //       } else if (result == 'blue') {
  //         trustOdds = (round[0].blue < round[0].red) ? true : false;
  //         odds = round[0].blue;
  //       }
  //     } else if (result == 'purple' || result == 'green') {
  //       if (result == 'purple') {
  //         trustOdds = (round[0].purple < round[0].green) ? true : false;
  //         odds = round[0].purple;
  //       } else if (result == 'green') {
  //         trustOdds = (round[0].green < round[0].purple) ? true : false;
  //         odds = round[0].green;
  //       }
  //     }
  //   });
  //
  //   if (trustOdds) {
  //     trustCount.yes++;
  //     oddsTotals.yes += odds;
  //   } else {
  //     trustCount.no++;
  //     oddsTotals.no += odds;
  //   }
  //
  //   trustCount.total++;
  //
  //   console.log(trustOdds);
  // });
  //
  // console.log(trustCount, oddsTotals);

  process.exit();
});
