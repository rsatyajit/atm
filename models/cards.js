var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cards = new Schema({
    'card_number':String,
    'pin':String,
    'balance':Number
}, {
    versionKey: false
});

module.exports  = mongoose.model('cards', cards, 'cards');