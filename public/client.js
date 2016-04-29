var socket = io();
var player = 0;
var myRoom;
var myBoard = [];

// socket events

socket.on('room-full', function () {
  window.alert('This room is full. Please try again.');
});

socket.on('win', function () {
  $('.cell').css('background-color', 'yellow');
  $('#page-title').html('You Win :) Please refresh to play again');
  socket.disconnect();
});

socket.on('lose', function () {
  $('.cell').css('background-color', 'brown');
  $('#page-title').html('You Lose :( Please refresh to play again');
  socket.disconnect();
});

socket.on('receive-board', function (square, color, board, turn) {
  var $box = $('[row=' + square[0] + '][col=' + square[1] + '][player=' + board + ']');
  $box.css('background-color', color);
  $('#turn-identifier').html('Turn: ' + turn);
});

socket.on('start-game', function (id, number) {
  inGameMode = true;
  player = number;
  $('#player-identifier').html('Player: ' + player);
  var randomCoords = generateRandomCoords();
  for (var i = 0; i < randomCoords.length; i++) {
    var coord = randomCoords[i];
    myBoard.push(coord);
    var $box = $('[row=' + coord[0] + '][col=' + coord[1] + '][player="you"]');
    $box.css('background-color', 'red');
  }
  socket.emit('initialize-board', myRoom, player, myBoard);
  var oldHTML = $('#player-identifier').html();
  $('#turn-identifier').html('Turn: 1');
});

var Game = function (boards) {
  myGame = this;
  this.$you = boards.$you;
  this.$opponent = boards.$opponent;
};

Game.prototype.setupBoards = function () {

  for (var i = 0; i < 10; i++) {
    var $rowDiv = $('<div>');
    for (var j = 0; j < 10; j++) {
      var $newDiv = $('<div>');
      $newDiv.attr({
        row: i,
        col: j
      });
      $newDiv.addClass('cell');
      $newDiv.addClass('cell-player');
      $newDiv.attr('player', 'you');
      $rowDiv.append($newDiv);
    }
    this.$you.append($rowDiv);
  }

  for (var i = 0; i < 10; i++) {
    var $rowDiv = $('<div>');
    for (var j = 0; j < 10; j++) {
      var $newDiv = $('<div>');
      $newDiv.attr({
        row: i,
        col: j,
      });
      $newDiv.addClass('cell');
      $newDiv.addClass('cell-opponent');
      $newDiv.attr('player', 'opponent');
      $rowDiv.append($newDiv);
    }
    this.$opponent.append($rowDiv);
  }

  // listeners
  $('.cell-opponent').click(this.move);

  // join room
  $('#room-submit').click(function (e) {
    var room = $('#room-input').val();
    $('#room-identifier').html('Room: ' + room);
    socket.emit('join-room', room);
    myRoom = room;
    $('#room-submit').val('');
  });
  $('#room-input').keyup(function (e) {
    if (e.keyCode === 13) {
      var room = $('#room-input').val();
      $('#room-identifier').html('Room: ' + room);
      socket.emit('join-room', room);
      myRoom = room;
      $('#room-input').val('');
    }
  });
}

Game.prototype.move = function (e) {
  var cell = e.target;
  var $cell = $(cell);
  var data = {
    row: $cell.attr('row'),
    col: $cell.attr('col')
  }
  socket.emit('update-board', myRoom, player, [Number(data.row), Number(data.col)]);
}

// functions

var generateRandomCoords = function () {
  var randomCoords = [];
  var randomShips = generateRandomShips();
  for (var i = 0; i < randomShips.length; i++) {
    randomCoords.push(numberToCoords(randomShips[i]));
  }
  return randomCoords;
};


var generateRandomShips = function () {
  var arr = [];
  while (arr.length < 15) {
    var randomNumber = Math.floor(Math.random() * 100);
    if (arr.indexOf(randomNumber) === -1) {
      arr.push(randomNumber);
    }
  }
  return arr;
}

var numberToCoords = function (number) {
  var coords = [];
  coords.push(Math.floor(number / 10));
  coords.push(number % 10);
  return coords;
}