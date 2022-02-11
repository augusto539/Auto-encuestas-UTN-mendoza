// REQUIRES
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
// VARIABLES
const app = express();
// SETINGS
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs');
// MIDDLEWARES
app.use(favicon('src/public/img/utn_logo.png'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(require('./routes/index'));
app.use(express.static(path.join(__dirname, 'public')))
// LISTENING THE SERVER
app.listen(app.get('port') , () => console.log(`Server runing on port: ${app.get('port')}`));