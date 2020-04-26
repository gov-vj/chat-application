const moongose = require('mongoose');
moongose.connect("mongodb://localhost:27017/app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(res => console.log('connected to db'))
  .catch(error => console.error(error));

exports.db = moongose.connection