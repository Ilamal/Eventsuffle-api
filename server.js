import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
const app = express();
const portNumber = 8080;

//Log to file with morgan
app.use(morgan('dev'));
app.use(morgan('common', {stream: fs.createWriteStream('./eventsuffle.log', {flags: 'a'})}));

//Start listening port localhost
app.listen(portNumber, () => {
    console.log('Server started and listening port ' + portNumber);
});

app.get('/', (req, res) => {
    console.log('Get on root');
    res.send('Hello world');
})