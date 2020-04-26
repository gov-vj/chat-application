const path = require('path');

exports.getChatPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'chat.html'));
};