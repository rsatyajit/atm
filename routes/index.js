var express = require('express');
var router = express.Router();
var cardModel = require('../models/cards'); 
var atmModel = require('../models/atms'); 
var transactionModel = require('../models/transactions'); 
var async = require('async');
var _ = require('lodash');

/*card and atm creation service*/
router.post('/insert_card_or_atm',function(req,res){
	var type = req.body.type;
	switch (type) {
		case 'card':
		if(!req.body.card_number || !req.body.pin || !req.body.balance){
			return res.send({ message : "parameters are missing" });
		}
		var whereCond = {
			card_number : req.body.card_number
		};	
		var data = {
			pin : req.body.pin,
			balance : req.body.balance
		};
		cardModel.update(whereCond , data , { upsert: true }).exec(function(err,result){
			if(err){
				return res.send(err);
			}else{
				return res.send({ message : "created successfully" });
			}
		});
		break;
		
		case 'atm':
		if(!req.body.atm_branch || !req.body.denomination || !req.body.count){
			return res.send({ message : "parameters are missing" });
		}
		var whereCond = {
			atm_branch : req.body.atm_branch,
			denomination : req.body.denomination
		};	
		var data = {
			count  :  req.body.count
		};
		atmModel.update(whereCond , data , { upsert: true }).exec(function(err,result){
			if(err){
				return res.send(err);
			}else{
				return res.send({ message : "created successfully" });
			}
		});
		break;
		
		default:
		 return res.send({ message : "parameters values are wrong" });

	}
});

function makeSorted(atms){
	for(var i = 0;i<atms.length;i++){
		atms[i].datas = _.orderBy(atms[i].datas, ['denomination'],['desc']);
	}
	return atms;
}

/*atm and cards available*/
router.get('/atms_and_cards',function(req,res){
	Promise.all([
		cardModel.find(),    	
		atmModel.aggregate([{
            $group: {
                _id: "$atm_branch",
                datas: {
                    $push: "$$ROOT"
                }
            }
        }])
  	]).then(([cards, atms]) => {

  		return res.send({
  			cards:cards,
  			atms : makeSorted(atms)
  		});
  	}).catch(error=>{
  		return res.send(error);
  	});
});

/*check pin is correct or not according to card*/
router.post('/check_pin',function(req,res){
	if(!req.body.card_number || !req.body.pin  ){
		return res.send({ status:404 , message : "select card and then provide pin" });
	}
	cardModel.count(req.body).exec((err,count)=>{
		if(err){
			return res.send({ status:0 , message : "error occured" , error : err })
		}else if(count == 0 ){
			return res.send({ status:0 , message : "invalid pin" });
		}else{
			return res.send({ status:1 , message : "please proceed" });
		}
	});
});

/********************************transaction api******************************************/
router.post('/transaction',function(req,res){
	if(!req.body.card_number || !req.body.amount || !req.body.atm_branch){
		return res.send({ status:404 , message : "amount,card and atm branch is missing" });	
	}
	
	var amount = parseInt(req.body.amount);
	if(amount <= 0 || amount%100!=0){
		return res.send({ status:0 , message : "invalid amount" });	
	}
	Promise.all([
		cardModel.findOne({ card_number : req.body.card_number , balance : { $gte : amount } }),
		atmModel.aggregate([
		{ 
			$match : {  atm_branch : req.body.atm_branch , count : { $gt : 0 } },
		},
		{
			$group : {
				_id:"$atm_branch",
				total : { $sum : { $multiply: [ "$denomination", "$count" ] }  },
				datas: {
	      			$push: "$$ROOT"
	        	}
	    	}
	    },{ 
			$match : { total : { $gte : amount } },
		}
	    ])
	]).then(([cardinfo,atminfo])=>{
		if(!cardinfo){
			return res.send({ status : 0 , message : "card doesnot have enough balance" });
		}
		if(atminfo.length == 0){
			return res.send({ status : 0 , message : "atm doesnot have enough balance" });
		}
		atminfo = makeSorted(atminfo);
		atmCalculationfunction(amount,cardinfo,atminfo,function(data){
			if(data.status == 0){
				return res.send(data);
			} else {
				/*update card amount + atm amount*/
				var cardWhere = { card_number : req.body.card_number };
				var cardData  = {  balance : cardinfo.balance - amount };
				cardModel.update( cardWhere , { $set :  cardData}).exec(function(err,updatedCarddetails){
					if(err){
						return res.send({ status:0 , error : err , message : "error occured." });					
					} else {
						/*atm updation is done here*/
						var atmWhere = { atm_branch : req.body.atm_branch };
						async.eachSeries(data.providedNotesDenomination, function iterator(item, callback) {
							atmWhere.denomination = item.denomination;
							var atmData = { count : item.available - item.count };
							atmModel.update( atmWhere , { $set :  atmData })
							.exec(function(err,updatedAtmdetails){
								callback();
							});
						}, function done(err) {
							console.log(atminfo ,amount);
							/*at last transaction*/
							var transactionObject = {
								'card_number': req.body.card_number,
								'atm_branch': req.body.atm_branch,
								'full_denomination_history':data,
								'date_of_transaction': new Date(),
								'card': { 'previous_amount' : cardinfo.balance , 'current_amount': cardData.balance  },
								'atm': { 'previous_amount' : atminfo[0].total , 'current_amount': atminfo[0].total - amount },
								'transactional_amount': amount
							};
							transactionModel.create(transactionObject,function(err,response){
								return res.send({ 
									status : 1 , 
									message : 'transaction successful! please check.', 
									providedNotesDenomination : data.providedNotesDenomination,
									avaiable_bal : cardData.balance
								});
							});
						});
					}
				}); 
			}
		});
	});
});

function atmCalculationfunction(calcAmt,cardinfo,atminfo,cb){
	
	var avaialableNotesDenomination = atminfo[0].datas;
	var counter = 0;
	var providedNotesDenomination = [];

	while(calcAmt!=0){
		if(counter == avaialableNotesDenomination.length){
			calcAmt = 0;
			return cb({status : 0 , message : "we cannot provide this amount to you" });
		} else {
			//console.log(calcAmt , avaialableNotesDenomination[counter].denomination);
			if(calcAmt >= avaialableNotesDenomination[counter].denomination){
				var count = parseInt(calcAmt/avaialableNotesDenomination[counter].denomination);
				if(count > avaialableNotesDenomination[counter].count){
					count = avaialableNotesDenomination[counter].count;
				}
				calcAmt = calcAmt-(avaialableNotesDenomination[counter].denomination*count);
				providedNotesDenomination.push({ 
					'denomination' : avaialableNotesDenomination[counter].denomination , 
					'count' : count,
					'available' : avaialableNotesDenomination[counter].count
				});
			}
			counter ++;
		}
	}
	return cb({ status : 1 , providedNotesDenomination : providedNotesDenomination });		
} 




module.exports = router;
