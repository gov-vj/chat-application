const WebSocket = require('ws');
const moongose = require('mongoose');
const Chat = require('./models/chat');
let connectedUsers = [];
const historyLimit = 100;
const rateLimitMap = new Map();

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

withinRateLimit = (user, current) => {
  if (!rateLimitMap.has(user)) {
    rateLimitMap.set(user, {
      lastAccessed: current,
      token: 2
    });
  }

  let { lastAccessed, token } = rateLimitMap.get(user);
  const timePassed = (current - lastAccessed) / 1000; // in seconds
  token += timePassed * 0.2;
  if (token > 2.0) {
      token = 2.0; // throttle
  }

  let canProceed;
  if (token < 1.0) {
      canProceed = false;
  } else {
    canProceed = true;
    token -= 1.0;
  }

  rateLimitMap.set(user, {
    lastAccessed: current,
    token
  });

  return canProceed;
};

exports.websocketHandler = (sessionParser, server) => {
  const wss = new WebSocket.Server({ noServer: true });
  const broadcast = (event, data) => {
    const msg = JSON.stringify({ event, data });
    wss.clients.forEach(client => {
      client.send(msg);
    });
  };

  wss.on('connection', (ws, req) => {
    connectedUsers.push({
      userId: req.session.userId,
      username: req.session.username
    });

    broadcast('USER_CONNECTED', connectedUsers.map(({ username }) => username));
    ws.on('close', () => {
      connectedUsers = connectedUsers.filter(({userId})=> userId !== req.session.userId);
      broadcast('USER_DISCONNECTED', connectedUsers.map(({ username }) => username));
    });

    ws.on('message', incomingMessage => {
      if (!withinRateLimit(req.session.userId, +new Date())) {
        ws.send(JSON.stringify({
          event: 'RATE_LIMIT_EXCEED',
          data: 'Only 2 request per 10 second is allowed. Please wait.'
        }));

        return;
      }

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