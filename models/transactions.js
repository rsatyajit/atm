var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transactions = new Schema({
	'card_number' : String,
    'atm_branch' : String,
    'full_denomination_history': Array,
    'date_of_transaction': Date,
    'card':Object,
    'atm':Object,
    'transactional_amount':Number
}, {
    versionKey: false
});

module.exports  = mongoose.model('transactions', transactions, 'transactions');