import express from 'express';
import morgan from 'morgan';
import fs, { lstat } from 'fs';
import eventRoute from './routes/event';

const app = express();
const PORT = process.env.PORT || 8080;

app.set('json spaces', 2);

//Log to file with morgan
app.use(morgan('dev'));
app.use(morgan('common', {stream: fs.createWriteStream('./eventsuffle.log', {flags: 'a'})}));

app.use(eventRoute);

//Start listening port localhost
app.listen(PORT, () => {
    console.log('Server started and listening port ' + PORT);
});
//Root get call
app.get('/', (req, res) => {
    console.log("Get on root");
    res.send("Hello world");
})