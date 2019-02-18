import express from 'express';
import connection from '../connections/event.connection';
const router = express.Router();

// Create new event call
router.post("/api/v1/event", (req, res) => {
    ValidateJson(req.body);
    // Values to be added
    const name = req.body.name;
    const dates = JSON.stringify({ dates: req.body.dates });
    const votes = JSON.stringify({"votes": []});
    // Do the insert query and return the inserted auto increment id
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
    ValidateJson(req.body);
    //Values to be added
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
            console.error("Not found");
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
                    eventVotes.votes.find(o => o.date == dates[i]).people.indexOf(name)==-1 ?
                    eventVotes.votes.find(o => o.date == dates[i]).people.push(name) : undefined;                    
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
    // Find all the events from database and return them under events object
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
    // Find the event with id, parse it because double stringify and send it
    connection.query("SELECT * FROM events WHERE id=?", [req.params.id], (err, rows, fields) => {
        if (err) {
            //Error with query
            res.sendStatus(500);
            console.error("Failed query with error : " + err.stack);
            return;
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
router.get("/api/v1/event/:id/results", (req, res) => {
    // Find the event with id and check where all participants have voted
    connection.query("SELECT * FROM events WHERE id=?", [req.params.id], (err, rows, fields) => {
        if (err) {
            //Error with query
            res.sendStatus(500);
            console.error("Failed query with error : " + err.stack);
            return;
        } else if (rows.length == 0) {
            res.sendStatus(404);
            console.log("Not found")
            return;
        } else {
            // Return the suitable dates as json
            const participants = [];
            const votes = JSON.parse(rows[0].votes).votes;
            for (let i in votes) {
                for(let j in votes[i].people) {
                    let person = votes[i].people[j];
                    !participants.includes(person) ? participants.push(person) : undefined;
                }
            }
            let suitableDates = [];
            for (let i in votes) {
                const people = votes[i].people;
                if(participants.length == people.length && participants.every((element, index)=> element === people[index] )) {
                    suitableDates.push({"date": votes[i].date, "people": people});
                }                
            }
            delete rows[0].dates;
            delete rows[0].votes;
            rows[0].suitableDates = suitableDates;
            res.json(rows[0]);
        }
    });
});

function ValidateJson(json) {
    const error = new SyntaxError("Dates must be an array with string dates!");
    if(!Array.isArray(json.dates)) {
        throw error
    } else {
        for(let i in json.dates) {
            if(typeof json.dates[i] != "string"){
                throw error;
            }
            if(!Date.parse(json.dates[i])) {
                throw error;
            }
        }
    }
}

export default router;