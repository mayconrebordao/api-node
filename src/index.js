const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.get('/', (req, res) =>{
//     res.send('ok');
// });

require("./app/controllers/index")(app);
// const fs = require('fs');
// fs.readdir('/home/maycon/', (err, files) => {
//     files.forEach((file) =>{
//         console.log(file);

//     }
// )
// });

app.use((req, res, next) => {
  const error = new Error("Not Found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.status + "! " + error.message
    }
  });
});

app.listen(8008, error => {
  if (error) console.log("Error " + error);
  else console.log("Server listen port: 8008");
});
