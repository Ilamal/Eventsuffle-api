import express from 'express';
import connection from '../connections/event.connection';
const router = express.Router();

// Create new event call
router.post("/api/v1/event", (req, res) => {
    console.log("Creating a new event");
    // Values to be added
    const name = req.body.name;
    const dates = JSON.stringify({ dates: req.body.dates });
    const votes = JSON.stringify({"votes": []});

    const queryString = "INSERT INTO events (name, dates, votes) VALUES (?, ?, ?)"

    connection.query(queryString, [name, dates, votes], (err, results, fields) => {
        if (err) {
            console.error("Failed to add new event : " + err.stack);
            res.sendStatus(500);
            return;
        }
        res.json({ "id": results.insertId });
    });
});

// Add votes to event call
router.post("/api/v1/event/:id/vote", (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const dates = req.body.votes;

    //Find the event by id
    connection.query("SELECT * FROM events WHERE id=?", [id], (err, row, fields) => {
        if (err) {
            //Error with query
            res.sendStatus(500);
            console.error("Failed query with error : " + err.stack);
            return;
        } else if (row.length == 0) {
            res.sendStatus(404);
            console.log("Not found");
            return;
        } else {
            //Edit the found event
            const event = row[0];
            let eventDates = JSON.parse(event.dates);
            let eventVotes = JSON.parse(event.votes);
            for (let i in dates) {
                try {
                    !eventDates.dates.find(o => o == dates[i]) ?
                    undefined :
                    !eventVotes.votes.find(o => o.date == dates[i]) ? 
                    eventVotes.votes.push({"date" : dates[i], "people" : [name]}) : 
                    eventVotes.votes.find(o => o.date == dates[i]).people.push(name)                   
                } catch (err) {
                   console.error(err.stack);
                }
            }
            // Add the votes to database
            event.votes = eventVotes;
            event.dates = eventDates;
            eventVotes = JSON.stringify(eventVotes);
            const queryString = "UPDATE events SET votes = ? WHERE id = ?";
            connection.query(queryString, [eventVotes, id], (err, results, fields) => {
                if (err) {
                    console.error("Failed to edit votes : " + err.stack);
                    res.sendStatus(500);
                    return;
                }
                res.json(event);
            });
        }
    });


});

//List all events call
router.get("/api/v1/event/list", (req, res) => {
    console.log("Listing all events");
    //Make the query to database
    connection.query("SELECT id, name FROM events", (err, rows, fields) => {
        if (err) {
            //Error with query
            res.sendStatus(500);
            console.error("Failed query with error : " + err.stack);
            return;
        } else {
            //Return all events as json
            const events = { 'events': rows };
            res.json(events);
        }
    });
});

//Get id call
router.get("/api/v1/event/:id", (req, res) => {
    console.log("Returning by id");

    connection.query("SELECT * FROM events WHERE id=?", [req.params.id], (err, row, fields) => {
        if (err) {
            //Error with query
            res.sendStatus(500);
            console.error("Failed query with error : " + err.stack);
            return;
        } else if (row.length == 0) {
            res.sendStatus(404);
            console.log("Not found")
            return;
        } else {
            //Return the event as json
            const event = row[0];
            event.dates = JSON.parse(row[0].dates);
            event.votes = JSON.parse(row[0].votes);
            res.json(row);
        }
    });
});

export default router;