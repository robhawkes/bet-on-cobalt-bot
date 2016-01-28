var roundLogs = require('./bet-on-cobalt-round-results.json');

var spread = {
  multi: 0.01,
  ace: 0.01,
  whole: 0.01,
  combo: 0.05,
  team: 0.1
};

var volts = 1000;

var pickTeam = function(odds) {
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

  // Reverse odds
  // oddsByTeam.reverse();

  return oddsByTeam[1][2];
};

roundLogs.forEach((round) => {
  console.log(volts);

  // Make bets
  var bets = {}, bet;
  for (var key of Object.keys(spread)) {
    // If betting on a team
    if (key == 'team') {
      // Pick a team
      var team = pickTeam(round[0]);
      bet = volts * spread[key];
      bets[team] = bet;
      console.log(`Placing ${bet} on ${team} with odds ${round[0][team]} (${volts} volts)`);
    } else {
      bet = volts * spread[key];
      bets[key] = bet;
      console.log(`Placing ${bet} on ${key} with odds ${round[0][key]} (${volts} volts)`);
    }

    volts -= bet;
  }

  // Collect winnings
  var winnings;
  for (var key of Object.keys(bets)) {
    if (round[1].indexOf(key) > -1) {
      winnings = bets[key] * round[0][key];
      volts += winnings;
      console.log(`Won ${winnings} on ${key} with odds ${round[0][key]} (${volts} volts)`);
    } else {
      console.log(`Lost ${bets[key]} on ${key} with odds ${round[0][key]} (${volts} volts)`);
    }
  }

  // process.exit();
});
