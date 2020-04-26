const WebSocket = require('ws');
const moongose = require('mongoose');
const Chat = require('./models/chat');
let connectedUsers = [];
const historyLimit = 100;

isClientSendingChatData = message => {
  return message.event
      && message.event === 'NEW_MESSAGE'
      && message.data
      && typeof message.data === 'string'
};

isClientRequestingHistory = message => {
  return message.event
      && message.event === 'REQ_HISTORY'
};

exports.websocketHandler = (sessionParser, server) => {
  const wss = new WebSocket.Server({ noServer: true });
  const broadcast = (event, data) => {
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ event, data }));
    });
  };

  wss.on('connection', (ws, req) => {
    connectedUsers.push({
      userId: req.session.userId,
      username: req.session.username
    });

    broadcast('USER_CONNECTED', connectedUsers);
    ws.on('close', () => {
      connectedUsers = connectedUsers.filter(({userId})=> userId !== req.session.userId);
      broadcast('USER_DISCONNECTED', connectedUsers);
    });

    ws.on('message', incomingMessage => {
      const parsedMessage = JSON.parse(incomingMessage);
      if (isClientSendingChatData(parsedMessage)) {
        const chat = new Chat({
          userId: req.session.userId,
          message: parsedMessage.data
        });

        chat.save()
        .then(() => {
          broadcast('NEW_MESSAGE', {
            username: req.session.username,
            message: parsedMessage.data
          });

          return Chat.count({});
        })
        .then(count => {
          if (count <= historyLimit) return;
          Chat.find({}, {_id: 1}).limit(count-historyLimit).sort({"createdAt": 1})
              .exec()
              .then(ids => ids.forEach(id => Chat.deleteOne({"_id": moongose.Types.ObjectId(id._id)}, function(err, res) {})));
        });
      } else if (isClientRequestingHistory(parsedMessage)) {
          Chat.find({}, {_id:0, userId: 1, message:1}).limit(100).sort({"createdAt": 1})
          .populate('userId', {_id:0, username: 1})
          .exec()
          .then(history => {
            history = history.map(({ userId: {username}, message }) => ({ username, message }));
            ws.send(JSON.stringify({
              event: 'MESSAGE_HISTORY',
              data: history
            }));
          })
      }
    });
  });


  
  server.on('upgrade', (req, socket, head) => {
    sessionParser(req, {}, () => {
      if (!req.session.userId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, function(ws) {
        wss.emit('connection', ws, req);
      });
    });
  });

  return wss;
};