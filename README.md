# atm
atm notes dispersion functionality

step 1 : clone the folder , enter the directory 'atm'

step 2: npm install

step 3 : import the database(mongodb) i.e; db_files/atm in your local system.

	3.1 : two collections are manadatory to run the app i.e; cards & atms.

OR

If db is not getting import then use the below api by running the app.
To insert the data. 	

step 4 : change the configuration of your db in "config/database.js".

step 5: npm start / nodemon / node app.js   

step 6 : open browser hit => http://localhost:4000 the app will run

step 7 : insert 1111 as pin for deafult card.

apis to insert data in mongodb : 

 api 1 : 

	 URL : http://localhost:4000/insert_card_or_atm

	 method : POST

	 data : 
	 	{
			type:card
			card_number:222222222222
			pin:1111
			balance:200000000
		}

		OR

		{
			type:atm
			atm_branch:birati
			denomination:200
			count:2
		} 		