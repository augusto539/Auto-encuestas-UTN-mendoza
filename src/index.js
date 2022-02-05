const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
const os = require('os')


const app = express();

// SETINGS
app.set('port', process.env.PORT || 3000);
//app.set('hostname', os.networkInterfaces()['Ethernet 2'][1]['address']); //get the ipv4 of the sistem
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
// cookies
app.use(cookieParser());

// ROUTES
app.use(require('./routes/index'));

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')))

// LISTENING THE SERVER
//app.listen(app.get('port'),app.get('hostname') , () => console.log(`Server runing at http://${app.get('hostname')}:${app.get('port')}/`));
app.listen(app.get('port') , () => console.log(`Server runing on port: ${app.get('port')}`));