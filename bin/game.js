#!/usr/bin/env node

// Workaround for node@ <= 0.10
if (typeof global.Map === 'undefined') {
  global.Map = require('hashmap');
  global.Map.prototype.delete = Map.prototype.remove;
}

// Dependencies
var Game = require('../lib/Game');
var Npc = require('../lib/Npc');
var prompt = require('prompt');

var game = new Game();
var npc;

game.on('ready', function () {
  // Start prompt
  prompt.start();

  // Pass prompt instance to game instance
  game.prompt = prompt;

  // Create your opponent
  npc = new Npc(game.settings, game.history);

  // lets get ready to rumbleeee!!
  game.emit('newRound', game.turn);
});

game.on('newRound', function (turn) {
  var checkWinnerHuman, checkWinnerNpc;

  checkWinnerNpc = game.human.units.gameUnits.every(function (unit) {
    return !unit.state;
  });
  if (!checkWinnerNpc) {
    checkWinnerHuman = game.npc.units.gameUnits.every(function (unit) {
      return !unit.state;
    });

    if (checkWinnerHuman) {
      return game.emit('finish', 'player');
    }
  } else {
    return game.emit('finish', 'computer');
  }

  // Keep track of rounds played
  game.roundsCounter++;

  // First clean the screen
  game.cleanScreen();

  // draw/re-draw game stuff
  game.drawBoards();
  game.drawNewLine();

  // If the game is already in play
  if (game.roundsCounter > 1) {
    game.drawLastAttackReport();
  }

  game.emit('changeTurn', turn);
});

game.on('changeTurn', function (turn) {
  // Change the turn in
  // the game instance
  game.turn = turn;

  if (turn === 'human') {
    game.promptPlayerMove();
  } else {
    game.bombPosition(npc.play());
  }
});

game.on('finish', function (winner) {
  // Clean screen
  game.cleanScreen();

  return game.announceWinner(winner);
});
