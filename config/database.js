var mongoose = require('mongoose');

/*for seeing query in console make it tur or false*/
mongoose.set('debug',true);

/*credentials*/
var MongoDBprotocol = 'mongodb';
var Username = 'root';
var Password = 'user123';
var hostname = 'localhost';
var Port = '27017';
var dbName = 'atm';
var authenticatedDb = 'admin';


//"mongodb://<username>:<password>@<host_name>:<port>/<dbname>?authSource=<auth_db>";
//mongodb://localhost:27017/dbname

if(!MongoDBprotocol || !hostname  ||  !Port  || !dbName){
	throw new Error('for db connection protocol , hostname , port and dbname is important');
}

var dbUrl = MongoDBprotocol + "://"; 
if(Username && Password){
 	dbUrl+= Username + ":" + Password + "@";
}
dbUrl+= hostname + ":" + Port + "/" + dbName;
if(authenticatedDb){
	dbUrl+= "?authSource=" + authenticatedDb;
}

console.log(dbUrl);

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl,function(err){
	if(err){
		console.log("mongodb  connection error: "+err );
	} else {
		console.log("mongodb  connection successful." );
	}
});
