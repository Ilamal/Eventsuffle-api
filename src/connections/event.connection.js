import express from 'express';
import mysql from 'mysql';

const host = 'localhost', user = 'root', password = 'root', database = 'event_data';

const connection = mysql.createConnection({
    host,
    user,
    password,
    database
});