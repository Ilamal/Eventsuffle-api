# Eventsuffle-api

A doodle.com like event planning backend application done for Futurice tech interview. Assignment page [here](https://gist.github.com/anttti/2b69aebc63687ebf05ec).

## Getting Started

This production environment runs with this `node.js` application, a `mysql` database and optionally cloud app-engine `heroku`. Instuctions below. OS syntacies may vary, I'm running everything on windows with `git-bash` as the command line client.

### Prerequisites

You'll need node and npm on your environment, check with:

```
node --version
```
You'll also need a mysql database to run somewhere. Here is a [getting started guide](https://dev.mysql.com/doc/mysql-getting-started/en/). Table creation script for this application:

```
CREATE TABLE `events` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `dates` json NOT NULL,
  `votes` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```
### Installing

Once you have the code cloned on your machine install the dependencies from package.json with npm:

```
npm install
```

You'll need to create a env file to the project root to get the environment running:

```
touch .env 
```
Add your database info to the file. 

```
HOST = localhost
USER = user
PASSWORD = yourpassword
DATABASE = event_data
CONNECTION_LIMIT = 151
```
Then run with `npm start` to start the program and to get watch `npm run dev`.

## Running the tests

The tests are made with using [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/). The tests are very basic but easily expandable if the project grows more.

### Test command

All the tests will run with:

```
npm test
```
The structure is following:
```
.
+-- Object-type tests
|   +-- helper tests
|   +-- model tests
+-- http tests
|   +-- gets
|   +-- posts
|   +-- puts
|   +-- deletes
```
## Deployment

The app runs on heroku server at [herokuapp](https://polar-bayou-45401.herokuapp.com). See queries and answers below. Uses `clearDB` as the mysql database, also running on heroku. This causes problems with mysql versioning but is reasonable (5.5 vs 5.6+). Heroku version has indecies starting from 2 and incrementing by 10. This is due to clearDB. Localhost instances of mysql most likely will start from 0 or 1 and increment by 1. Heroku deployment done via the heroku branch with procfile. Heroku node.js [website](https://devcenter.heroku.com/articles/getting-started-with-nodejs) has more info.

***
### Copied from the original assignment
## List all events
Endpoint: `/api/v1/event/list`

### Request
Method: `GET`

### Response
Body:

```
{
  "events": [
    {
      "id": 2,
      "name": "Jake's secret party"
    },
    {
      "id": 12,
      "name": "Bowling night"
    },
    {
      "id": 22,
      "name": "Tabletop gaming"
    }
  ]
}
```

## Create an event
Endpoint: `/api/v1/event`

### Request
Method: `POST`

Body:

```
{
  "name": "Jake's secret party",
  "dates": [
    "2014-01-01",
    "2014-01-05",
    "2014-01-12"
  ]
}
```

### Response
Body:

```
{
  "id": 2
}
```

## Show an event
Endpoint: `/api/v1/event/{id}`

### Request
Method: `GET`

Parameters: `id`, `long`

### Response
Body:

```
{
  "id": 2,
  "name": "Jake's secret party",
  "dates": [
    "2014-01-01",
    "2014-01-05",
    "2014-01-12"
  ],
  "votes": [
    {
      "date": "2014-01-01",
      "people": [
        "John",
        "Julia",
        "Paul",
        "Daisy"
      ]
    }
  ]
}
```

## Add votes to an event
Endpoint: `/api/v1/event/{id}/vote`

### Request
Method: `POST`

Parameters: `id`, `long`

Body:

```
{
  "name": "Dick",
  "votes": [
    "2014-01-01",
    "2014-01-05"
  ]
}
```

### Response

```
{
  "id": 0,
  "name": "Jake's secret party",
  "dates": [
    "2014-01-01",
    "2014-01-05",
    "2014-01-12"
  ],
  "votes": [
    {
      "date": "2014-01-01",
      "people": [
        "John",
        "Julia",
        "Paul",
        "Daisy",
        "Dick"
      ]
    },
    {
      "date": "2014-01-05",
      "people": [
        "Dick"
      ]
    }
  ]
}
```

## Show the results of an event
Endpoint: `/api/v1/event/{id}/results`
Responds with dates that are **suitable for all participants**.

### Request
Method: `GET`

Parameters: `id`, `long`

### Response

```
{
  "id": 0,
  "name": "Jake's secret party",
  "suitableDates": [
    {
      "date": "2014-01-01",
      "people": [
        "John",
        "Julia",
        "Paul",
        "Daisy",
        "Dick"
      ]
    }
  ]
}
```
You have to have valid dates and a name in your json body.

## Web Errors
Error codes this application sends:
```
400 - Invalid syntax
404 - Not found
500 - Internal server error
```

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [Npm](https://www.npmjs.com/) - Dependency Management
* [Morgan](https://github.com/expressjs/morgan) - Used for logging
* [Babel](https://babeljs.io/) - Used for ES6 syntax
* [Mocha](https://mochajs.org/) - Testing framework used
* [Chai](https://www.chaijs.com/) - Assertion testing library used
* [MySql](https://www.mysql.com/) - Database used

## Authors

* **Ilari Malinen** - *Initial work* - [Ilamal](https://github.com/Ilamal)

## License

This project is licensed under the MIT License

## Future development

Ideas and features to be added in the future...

### Clustering

Node.js is a single threaded and performance could be helped with somekind of clustering https://nodejs.org/api/cluster.html

### Validation

The api has some validation for data inserted, but it's far from perfect. More validation would be needed.

### Delete events

The api is missing delete method all together. This could be added.

### Frontend

There could be a client application for this in the future.

### More routes and models

Basics are set and more models, connections and routes could be added.

### Better database model

the api uses a little akward style of data, with storing json inside the mysql columns and this brings a bit wierd situations in the code: 
```
dates : { dates : [] }
votes : { votes : {date : "2019-03-28" people : ["Ilari"]} }
```
This could be fixed by creating table relations in the database instead of storing json (which also brings problems with mysql versions lower that 5.6)
