const express = require('express');
const cors = require('cors');
const app = express();
// app.use(cors());
const server = require('https').createServer()
const io = require('socket.io')(server,{
    cors:{
        origins:'https://cold.magios.org:* http://localhost:4200*',
         //origins:'*',
        methods: ["GET", "POST", "OPTIONS", "HEAD", "PUT", "PATCH", "DELETE"],
        credentials:true
    }
    
}, {transports: ['websocket']});
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
    socket.on('eventJsonModeler',(res)=>{
        const data = res;
        socket.to(nameRoom).emit('eventJsonModeler', data);
    })

})

server.listen(3000,()=>{
    console.log(">> Socket listo y escuchando por el puerto: 5000")
})

