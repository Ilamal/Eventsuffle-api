import express from 'express';
import connection from '../connections/event.connection';

const router = express.Router();

//List all events call
router.get("/api/v1/event/list", (req, res) => {
    console.log("Listing all events");
    //Make the query to database
    connection.query("SELECT id, name FROM events", (err, rows, fields) => {
        if(err) {
            //Error with query
            res.sendStatus(500);
            console.log("Failed query with error : " + err);
            return;
        } else {
            //Return all events as json
            const events = {'events' : rows};
            res.json(events);
        }
    });
});

export default router;