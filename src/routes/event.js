import express from 'express';
import connection from '../connections/connection';
import eventHelper from '../helpers/event.helper';
const router = express.Router();

// Create new event call
router.post("/api/v1/event", (req, res, next) => {
    eventHelper.ValidateJson(req.body);
    // Values to be added
    const name = req.body.name;
    const dates = JSON.stringify({ dates: req.body.dates });
    const votes = JSON.stringify({"votes": []});
    // Do the insert query and return the inserted auto increment id
    const queryString = "INSERT INTO events (name, dates, votes) VALUES (?, ?, ?)"    
    connection.query(queryString, [name, dates, votes], (err, results, fields) => {
        if (err) {
            next("Failed to add new event : " + err.stack);
        }
        res.json({ "id": results.insertId });
    });
});

// Add votes to event call
router.post("/api/v1/event/:id/vote", (req, res, next) => {
    eventHelper.ValidateJson(req.body);
    //Values to be added
    const id = req.params.id;
    const name = req.body.name;
    const dates = req.body.votes;

    //Find the event by id
    connection.query("SELECT * FROM events WHERE id=?", [id], (err, row, fields) => {
        if (err) {
            //Error with query
            next(new Error("Failed query with error : " + err.stack));
        } else if (row.length == 0) {
            res.sendStatus(404);
            console.error("Not found");
            return;
        } else {
            //Edit the found event
            const event = row[0];
            let eventVotes = eventHelper.AddVotes(event, name, dates);                       
            // Add the votes to database           
            const queryString = "UPDATE events SET votes = ? WHERE id = ?";
            connection.query(queryString, [eventVotes, id], (err, results, fields) => {
                if (err) {
                    next("Failed to edit votes : " + err.stack);
                }
                res.json(event);
            });
        }
    });
});

//List all events call
router.get("/api/v1/event/list", (req, res, next) => {
    // Find all the events from database and return them under events object
    connection.query("SELECT id, name FROM events", (err, rows, fields) => {
        if (err) {
            //Error with query
            next(new Error("Failed query with error : "));
        } else {
            //Return all events as json
            const events = { 'events': rows };
            res.json(events);
        }
    });
});

//Get id call
router.get("/api/v1/event/:id", (req, res, next) => {
    // Find the event with id, parse it because double stringify and send it
    connection.query("SELECT * FROM events WHERE id=?", [req.params.id], (err, rows, fields) => {
        if (err) {
            //Error with query
            next(new Error("Failed query with error : " + err.stack));
        } else if (rows.length == 0) {
            res.sendStatus(404);
            console.log("Not found")
            return;
        } else {
            //Return the event as json
            rows[0].dates = JSON.parse(rows[0].dates);
            rows[0].votes = JSON.parse(rows[0].votes);
            res.json(rows[0]);
        }
    });
});

// Get results call
router.get("/api/v1/event/:id/results", (req, res, next) => {
    // Find the event with id and check where all participants have voted
    connection.query("SELECT * FROM events WHERE id=?", [req.params.id], (err, rows, fields) => {
        if (err) {
            //Error with query
            next(new Error("Failed query with error : " + err.stack));
        } else if (rows.length == 0) {
            res.sendStatus(404);
            console.log("Not found")
            return;
        } else {
            // Return the suitable dates as json          
            res.json(eventHelper.EventToResults(rows[0]));
        }
    });
});

export default router;