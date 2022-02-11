// REQUIRES
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
// VARIABLES
const app = express();
// SETINGS
app.set('port', process.env.PORT || 3000);
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
app.listen(app.get('port') , () => console.log(`Server runing on port: ${app.get('port')}`));