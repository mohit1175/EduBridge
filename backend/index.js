require('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');
const cors = require('cors');

const app = express ();

app.use(express.json());
app.use(cors({origin: '*'}));

mongoose.connect (process.env.MONGODB_URI)
    .then (() => {

        console.log("connected to db successfully");
        app.listen (4000, () => {
            console.log('Server running on port 4000');
        });
    })

    .catch((error) => {
        console.log('db faiked', error);
    });