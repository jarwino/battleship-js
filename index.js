var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var roomDB = [];

app.use('/', express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('move', function (move) {
    updateState(data);
  });
  socket.on('join-room', function (room) {
      var rooms = io.sockets.adapter.rooms;
      if (rooms[room] && Object.keys(rooms[room]).length === 2) {
        socket.emit('room-full');
      } else if (rooms[room]) {
        socket.join(room);
        var members = Object.keys(rooms[room]);
        var player2 = io.sockets.connected[members[0]];
        socket.emit('start-game', socket.id, 2);
        player2.emit('start-game', player2.id, 1);
        roomDB.push({
          room: room,
          player1ID: player2.id,
          player2ID: socket.id,
          turn: 1,
          player1Board: [],
          player2Board: []
        });
      } else {
        socket.join(room);
      }
  });

socket.on('initialize-board', function (room, player, board) {
  for (var i = 0; i < roomDB.length; i++) {
    var gameRoom = roomDB[i];
    if (gameRoom.room === room) {
      roomDB[i]['player' + player + 'Board'] = board;
    }
  }
});


socket.on('update-board', function (room, player, coord) {
  for (var i = 0; i < roomDB.length; i++) {
    var gameRoom = roomDB[i];
    if (gameRoom.room === room) {
      if (gameRoom.turn === player) {
        if (roomDB[i].turn === 1) {
          roomDB[i].turn = 2;
        } else {
          roomDB[i].turn = 1;
        }
        var yourID = roomDB[i]['player' + player + 'ID'];
        var opponentID = roomDB[i]['player' + (3 - player) + 'ID'];
        var board = roomDB[i]['player' + (3 - player) + 'Board'];
        var coordIndex = board.indexOf(coord);
        var shipFound = false;
        for (var j = 0; j < board.length; j++) {
          var currentCoord = board[j];
          if (currentCoord[0] === coord[0] && currentCoord[1] === coord[1]) {
            board.splice(j, 1);
            io.to(yourID).emit('receive-board', coord, 'green', 'opponent', roomDB[i].turn);
            io.to(opponentID).emit('receive-board', coord, 'black', 'you', roomDB[i].turn);
            shipFound = true;
            if (board.length === 0) {
              io.to(yourID).emit('win');
              io.to(opponentID).emit('lose');
              roomDB.splice(j, 1);
            }
            break;
          }

        }
        if (!shipFound) {
          io.to(yourID).emit('receive-board', coord, 'blue', 'opponent', roomDB[i].turn);
          io.to(opponentID).emit('receive-board', coord, 'white', 'you', roomDB[i].turn);
        }

      }

    }
  }
});
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});