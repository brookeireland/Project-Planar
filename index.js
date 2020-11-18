const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var players = [];

function Player(x, y, id, r) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.r = r;
}

console.log("hello there");

//Set static folder
app.use(express.static('public'));


//see when client connects
io.on('connection', socket => {
  console.log("new Connection: " + socket.id);

  //receive player information from client, then create a new Player object and add to players array
  socket.on('player', player => {
    newPlayer = new Player(player.x, player.y, socket.id, player.r);
    players.push(newPlayer);
    console.log("players: ", players);

    //send data to client with same id
    io.to(socket.id).emit('data', players);

    socket.on('disconnect', () => {
      const index = players.findIndex(x => x.id === socket.id);

      if(index > -1) {
        players.splice(index, 1);
      }
    })

    socket.on('update', data => {
      let player;
      for(let i = 0; i < players.length; i++) {
        if(socket.id === players[i].id) {
          player = players[i];
        }
      }
      player.x = data.x;
      player.y = data.y;
    })
  })
})

const port = process.env.port || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
