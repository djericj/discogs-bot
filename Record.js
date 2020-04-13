let mongoose = require('mongoose')

let record = new mongoose.Schema({
    discogs_id: Number
})

module.exports = mongoose.model('Record', record)