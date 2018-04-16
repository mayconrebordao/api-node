const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/api4');
mongoose.Promise = global.Promise;


module.exports = mongoose;