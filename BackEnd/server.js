const express = require('express');
const cors = require('cors');
const app = express();
// app.use(cors());
const server = require('http').Server(app)
const io = require('socket.io')(server,{
    cors:{
        origins:'http://localhost:4200',
        methods: ["GET", "POST"]
    }
    
});

io.on('connection', (socket) => {
    const idHandShake = socket.id;
    const { nameRoom } = socket.handshake.query;
    
    socket.join(nameRoom);
    
    console.log(`Hola dispositivo: ${idHandShake} se unio a la sala --> ${nameRoom}`)
    
    socket.on('event', (res) =>{
        const data = res;
        //console.log(res);

        socket.to(nameRoom).emit('event', data);
    })

    socket.on('eventModeler',(res)=>{
        const data = res;
        socket.to(nameRoom).emit('eventModeler', data);
    })

})

server.listen(5000,()=>{
    console.log(">> Socket listo y escuchando por el puerto: 5000")
})

