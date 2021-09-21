const express = require('express');
const app = express();
const http = require('http');
const { v4: uuidv4 } = require("uuid");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server,{debug:true});

const PORT = process.env.PORT || 5000;

app.set('view engine','ejs');

app.use(express.static('public'));
app.use("/peerjs",peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room});
})

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

io.on('connection', (socket) => {
    
    socket.on("join-room",(roomId,userId)=>{
        console.log('roomId'+roomId,'userId'+userId);
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
        
        //when user disconnects
        socket.on('disconnect', () => {
            console.log('user disconnected ' + userId);
            io.to(roomId).emit("user-disconnected", userId);
        });
        
    })

    

    
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});