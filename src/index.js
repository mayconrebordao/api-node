const express = require('express');
const bodyParser = require('body-parser');

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

app.listen(3000);