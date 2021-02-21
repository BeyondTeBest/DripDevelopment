const mongo = require('mongoose');



const fun = mongo.model('fun', new mongo.Schema({
    for: { type: String },
    data: { type: Array, default: [] }
}));

module.exports = {
    fun
}