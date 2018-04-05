const nodemailer =  require('nodemailer');

const path = require('path');
const hbs = require('nodemailer-express-handlebars');

const  { host, port, secure, user, pass } = require('../config/mail.json');


const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass
  }
});

// console.log({ host, port, secure, user, pass });

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./src/resource/mail/'),
    extName: '.html',
}));






module.exports = transport;


