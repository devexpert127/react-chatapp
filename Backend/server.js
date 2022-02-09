var app = require('express')();
var http = require('http').createServer(app);
const PORT = 8080;
var io = require('socket.io')(http);
var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: [],
    messages: []
}, {
    name: 'Funny',
    participants: 0,
    id: 2,
    sockets: [],
    messages: []
}, {
    name: 'Politics',
    participants: 0,
    id: 3,
    sockets: [],
    messages: []
}, {
    name: 'Sports',
    participants: 0,
    id: 4,
    sockets: [],
    messages: []
}];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    console.log(socket.username);
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        STATIC_CHANNELS.forEach(c => {
            if (c.id === message.channel_id) {
                c.messages.push(message);
            }
        });
        io.emit('message', message);
    });

    socket.on('delete-message', message => {
        STATIC_CHANNELS.forEach(c => {
            if (c.id === message.channel_id) {
                c.messages = c.messages.filter(function(original){
                    return original.id !== message.id;
                });
            }
        });
        io.emit('delete', message);
    });

    socket.on('edit-message', message => {
        STATIC_CHANNELS.forEach(c => {
            if (c.id === message.channel_id) {
                c.messages = c.messages.map(function(original){
                    if (original.id !== message.id)
                        return original;
                    else {
                        return message;
                    }
                });
            }
        });
        io.emit('edit', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});




/**
 * @description This method retrieves the messages of user
 * @param username username of message
 */
app.get('/get-my-messages', (req, res) => {
    let messages = [];
    STATIC_CHANNELS.forEach(c => {
        c.messages.forEach(message => {
            console.log(message);
            if (req.query.username === message.senderName)
                messages.push(message);
        });
    });

    res.json({
        messages: messages
    })
});

/**
 * @description This method retrieves the messages of channel
 * @param channel channel id
 */
 app.get('/get-channel-message', (req, res) => {
    let messages = [];
    STATIC_CHANNELS.forEach(c => {
        if (c.id == req.query.channel)
            messages = c.messages;
    });

    res.json({
        messages: messages
    })
});


/**
 * @description This method retrieves the channels
 */
 app.get('/getChannels', (req, res) => {
    
    res.json({
        channels: STATIC_CHANNELS
    })
});

/**
 * @description This method retrieves the users in channel
 */
 app.get('/get-users-in-channel', (req, res) => {
    let users = [];

    STATIC_CHANNELS.forEach(c => {
        if (c.id == req.query.channel) {
            users.push(c.sockets);
        }
    });

    res.json({
        users: users
    })
});

/**
 * @description This method retrieves the statistic
 */
 app.get('/statistics', (req, res) => {
    let totalMessage = 0;
    let channelMessages = [];
    let userMessages = {};

    STATIC_CHANNELS.forEach(c => {
        totalMessage += c.messages.length;
        channelMessages.push({channel_id: c.id, messages: c.messages.length});

        c.messages.forEach(message => {
            if (userMessages[message.senderName]) {
                userMessages[message.senderName]++;
            } else {
                userMessages[message.senderName] = 1;
            }
        })
    });


    res.json({
        totalMessage: totalMessage,
        channelMessages : channelMessages,
        userMessages: userMessages
    })
});