import express from 'express';
import morgan from 'morgan';
import fs, { lstat } from 'fs';
import eventRoute from './routes/event';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 8080;

app.set('json spaces', 2);
app.use(bodyParser.json());

//Log to file with morgan
app.use(morgan('dev'));
app.use(morgan('common', {stream: fs.createWriteStream('./eventsuffle.log', {flags: 'a'})}));

app.use(eventRoute);

//Root get call
app.get('/', (req, res) => {
    res.send("Hello world");
});
// Handler for 404 - Resource Not Found
app.use((req, res, next) => {
    res.sendStatus(404);
});
// Handler for 500 Internal server error and - 400 invalid syntax error
app.use(function (err, req, res, next) {
    console.error(err.stack)
    if(err instanceof SyntaxError) {
        res.sendStatus(400);
    } else {
        res.status(500).send('Something broke!');
    }
  })
//Start listening port localhost
app.listen(PORT, () => {
    console.log('Server started and listening port ' + PORT);
});