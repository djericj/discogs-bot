let mongoose = require('mongoose')

let discog = new mongoose.Schema({
    discogs_id: Number
})

module.exports = mongoose.model('Discog', discog)