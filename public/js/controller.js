

angular.module("Atm")
    .controller("screen1Controller", function($scope, $http ,$location) {
    	$scope.cards={};
    	$scope.atms = {};
    	$scope.transaction = {};

    	$scope.cards.selected_card_number = '';
    	$scope.atms.selected_atm = '';
    	
    	$scope.cards.error = 0;
    	$scope.atms.error = 0;

    	$scope.cards.pinerror = 0;
    	$scope.atms.amounterror = 0;
    	
    	$scope.cards.pinerrorMsg = '';
    	$scope.atms.amounterrorMsg = '';
        
        $http.get("/atms_and_cards")
        .success(function(data) {
            console.log(data);
            $scope.cards.data = data.cards;
            $scope.atms.data = data.atms; 
        }).error(function(error){
            console.log(error);
        });

        $scope.screenTwo = function(){
        	$scope.cards.error = 0;
			$scope.cards.pinerror = 0;

        	if( !$scope.cards.selected_card_number ){
        		$scope.cards.error = 1;
        	} else if(!$scope.cards.pin) { 
        		$scope.cards.pinerrorMsg = 'please provide pin';
        		$scope.cards.pinerror = 1;
        	} else {
        		var data = {
        			'card_number':$scope.cards.selected_card_number,
					 'pin':$scope.cards.pin
        		};
        		$http.post("/check_pin",data)
		        .success(function(data) {
		            console.log(data);
		            if(data.status==0){
		            	$scope.cards.pinerrorMsg = data.message;
        				$scope.cards.pinerror = 1;
		            } else {
		            	localStorage.setItem('card_no',$scope.cards.selected_card_number);
		            	location.href="#/screen2";
		            }
		        }).error(function(error){
		            console.log(error);
		        });	
        	}
        }

        $scope.screenThree=function(){
        	$scope.atms.error = 0;
			$scope.atms.amounterror = 0;

        	if( !$scope.atms.selected_atm ){
        		$scope.atms.error = 1;
        	} else if(!$scope.atms.amount) { 
        		$scope.atms.amounterrorMsg = 'please provide amount';
        		$scope.atms.amounterror = 1;
        	} else {
        		var data = {
        			card_number: localStorage.getItem('card_no'),
					amount:$scope.atms.amount,
					atm_branch:$scope.atms.selected_atm
        		};
        		$http.post("/transaction",data)
		        .success(function(data) {
		            console.log(data);
		            if(data.status==0){
        				$scope.atms.amounterrorMsg = data.message;;
        				$scope.atms.amounterror = 1;
		            } else {
		            	localStorage.removeItem('card_no');
		            	localStorage.setItem('tr_det',JSON.stringify(data));
		            	location.href="#/screen3";
		            }
		        }).error(function(error){
		            console.log(error);
		        });	
        	}	
        }


        $scope.checkcardno = function(){
        	if(!localStorage.getItem('card_no')){
        		location.href = "#/screen1";
        	}
        }

        $scope.checktransaction = function(){
        	if(!localStorage.getItem('tr_det')){
        		location.href = "#/screen1";
        	}else{
        		$scope.transaction = JSON.parse(localStorage.getItem('tr_det'));
        	}
        }

        $scope.clear=function(){
        	localStorage.clear();
        }

        $scope.home=function(){
        	location.href = "#/screen1";
        }


})