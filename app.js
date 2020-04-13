record = require('./Record');
axios = require('axios');
flatted = require('flatted');
circularJSON = require('circular-json');

var mongoClient = require('mongodb').MongoClient;

const CONSUMER_KEY = "RtHKUboriKZllOucwTTt";
const CONSUMER_SECRET = "cTCJRffZRECbcIZtIzJWZeANtZPAfizW";
const REQUEST_TOKEN_URL = "https://api.discogs.com/oauth/request_token";
const AUTH_URL = "https://www.discogs.com/oauth/authorize";
const ACCESS_TOKEN_URL = "https://api.discogs.com/oauth/access_token";

getIds();

async function getIds() {
    // Connect to the db

    var url = "mongodb://saturn/records";

    const client = await mongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        var f = getRecords().then(arr => {
            load(arr);
        });
    } finally {
        //sleep(10000);
    }

}

async function load(arr) {
    for (var rec in arr) {
        console.log(arr[rec]);
        await query(arr[rec]);
        await sleep(10000);
    }
}

async function getRecords() {
    var url = "mongodb://saturn/records";
    const client = await mongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .catch(err => { console.log(err); });
    const db = client.db("records");
    return new Promise(function (resolve, reject) {
        db.collection("records").find().toArray(function (err, docs) {
            if (err) {
                // Reject the Promise with an error
                return reject(err)
            }

            // Resolve (or fulfill) the promise with data
            return resolve(docs)
        })
    })
}


async function query(myd) {
    if (myd) {
        var result = await queryAPI(myd.release_id);
        await insert(result);

        console.log("inserted " + myd.release_id);
    }
    //console.log(myd.release_id);
}

function queryAPI(id) {
    let url = "https://api.discogs.com/releases/" + id;

    var options = {
        method: 'GET',
        headers: {
            'Authorization': 'Discogs key=' + CONSUMER_KEY + ', secret=' + CONSUMER_SECRET
        },
        data: "",
        url: url
    };

    console.log("Query: " + url);

    return axios(options)
        .then(response => {
            console.log(response.data);
            return response.data;
        })
        .catch(error => {
            console.log("Error:" + error);
            return error;
        });
}

function insert(document) {

    var mongoClient = require('mongodb').MongoClient;
    var url = "mongodb://saturn/records";

    return mongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("records");
        dbo.collection("discogs").insertOne(document, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();

        });
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}