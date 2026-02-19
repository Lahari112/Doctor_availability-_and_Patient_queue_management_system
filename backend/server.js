const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

let queue = [];
let docStatuses = {};
let serving = {};

io.on('connection', (socket) => {
    socket.emit('update_all', { queue, docStatuses, serving });

    socket.on('join_queue', (data) => {
        const token = "TKT-" + Math.floor(100 + Math.random() * 900);
        queue.push({ ...data, token });
        io.emit('update_all', { queue, docStatuses, serving });
    });

    socket.on('next_patient', (doctorName) => {
        const index = queue.findIndex(p => p.doctorName === doctorName);
        if (index !== -1) {
            serving[doctorName] = queue.splice(index, 1)[0];
            io.emit('update_all', { queue, docStatuses, serving });
        }
    });

    socket.on('end_consultation', (doctorName) => {
        serving[doctorName] = null; 
        io.emit('update_all', { queue, docStatuses, serving });
    });

    socket.on('update_doctor_status', (data) => {
        docStatuses[data.doctorId] = data.status;
        io.emit('update_all', { queue, docStatuses, serving });
    });
});

http.listen(3001, () => console.log("Server running on port 3001"));