'use strict';

const eventHelper = {
    ValidateJson: (json) => {
        const error = new SyntaxError("Dates and votes must be an array with string dates!");
        let test;
        try {
            JSON.stringify(json)
        } catch (err) {
            throw error;
        }
        if (!json) {
            throw error;
        }
        if (!json.name) {
            throw error;
        }
        if (json.dates) {
            test = json.dates;
        } else if (json.votes) {
            test = json.votes
        } else {
            return;
        }
        if (!Array.isArray(test)) {
            throw error
        } else {
            //Check the arrays to be valid string dates
            for (let i in test) {
                if (typeof test[i] != "string") {
                    throw error;
                }
                if (!Date.parse(test[i])) {
                    throw error;
                }
            }
        }
    },
    AddVotes: (event, name, dates) => {
        let eventDates = JSON.parse(event.dates);
        let eventVotes = JSON.parse(event.votes);
        for (let i in dates) {
            try {
                !eventDates.dates.find(o => o == dates[i]) ?
                    undefined :
                    !eventVotes.votes.find(o => o.date == dates[i]) ?
                        eventVotes.votes.push({ "date": dates[i], "people": [name] }) :
                        eventVotes.votes.find(o => o.date == dates[i]).people.indexOf(name) == -1 ?
                            eventVotes.votes.find(o => o.date == dates[i]).people.push(name) : undefined;
            } catch (err) {
                console.error(err.stack);
            }
        }
        // Modify event
        event.votes = eventVotes;
        event.dates = eventDates;
        eventVotes = JSON.stringify(eventVotes);
        return eventVotes;
    },
    EventToResults: (event) => {
        const participants = [];
        // Get all voters
        const votes = JSON.parse(event.votes).votes;
        for (let i in votes) {
            for (let j in votes[i].people) {
                let person = votes[i].people[j];
                !participants.includes(person) ? participants.push(person) : undefined;
            }
        }
        // Find suitable dates
        let suitableDates = [];
        for (let i in votes) {
            const people = votes[i].people;
            if (participants.length == people.length && participants.every((element, index) => element === people[index])) {
                suitableDates.push({ "date": votes[i].date, "people": people });
            }
        }
        // Modify event
        delete event.dates;
        delete event.votes;
        event.suitableDates = suitableDates;
        return event;
    }
}

export default eventHelper;