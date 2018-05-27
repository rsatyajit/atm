var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var atms = new Schema({
	'atm_branch' : String,
    'denomination':Number,
    'count':Number
}, {
    versionKey: false
});

module.exports  = mongoose.model('atms', atms, 'atms');