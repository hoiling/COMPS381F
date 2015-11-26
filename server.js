var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongodbURL = 'mongodb://hoiling:123456@ds053894.mongolab.com:53894/comps381f';

var RestaurantSchema = require('./models/restaurant');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/create', function(req, res) {	
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: " ));
	db.once('open', function(callback) {
		
		console.log('Incoming request: POST');
		console.log('Request body: ', req.body);
		
		var Restaurant = mongoose.model('restaurant', RestaurantSchema);
		var input = {address: {building: "", street: "", zipcode:"", coord: [],}, 
							borough: "", cuisine: "", restaurant_id: "", name: "",grades:[]};
		var inGrade = {};
		
		// save data from POST Form
		input.address.building = req.body.building;
		input.address.street = req.body.street;
		input.address.zipcode = req.body.zipcode;
		input.address.coord[0] = parseFloat(req.body.lon);
		input.address.coord[1] = parseFloat(req.body.lat);
		input.borough = req.body.borough;
		input.cuisine = req.body.cuisine;
		input.restaurant_id = req.body.restaurant_id;
		input.name = req.body.name;				
		
		if(req.body.date && req.body.grade && req.body.score) {
			var date = req.body.date.split(',');
			var grade = req.body.grade.split(',');
			var score = req.body.score.split(',');
			
			if(date.length == grade.length && date.length == score.length) {
				for (var i = 0; i<date.length; i++) {
				inGrade.date = date[i];
				inGrade.grade = grade[i];
				inGrade.score = parseInt(score[i]);
				input.grades.push(inGrade);
				inGrade = {};
				}				
			
				var newRestaurant = new Restaurant(input);
				newRestaurant.save(function(err) {
					console.log(input);
					if(err) {
						console.log("Error: " + err.message);
						res.status(500).json(err);
					}
					else {
						db.close();	
						console.log("Restaurant is created");
						res.status(200).json({Message: 'Insert Done', id: input.restaurant_id});						
					}
				});	
			}
			else {
				db.close();
				console.log("Error: Input data length is different");
				res.status(200).send('Input data length is different');
			}
			
		}
		else {
			db.close();
			console.log("Error: Missing input data");
			res.status(200).send('Missing input data');
		}
	});
}); // createRestaurant

app.delete('/delete/:id', function(req,res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: "));
	db.once('open', function (callback) {
		
		console.log('Incoming request: DELETE');
		
		var Restaurant= mongoose.model('restaurant', RestaurantSchema);
		Restaurant.find({restaurant_id: req.params.id}).remove(function(err) {
			if (err) {
				console.log("Error: " + err.message);
				db.close();
				res.status(500).json(err);
			}
			else {
				console.log("Restaurant Deleted");
				console.log("Restaurant ID : " + req.params.id);	
				db.close();
				res.status(200).json({Message: 'Delete Done', id: req.params.id});
			}
		});		
	});		
}); // removeRestaurant

app.put('/update/:id/:attrib/:attrib_value', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Connection ERROR: '));
	db.once('open', function(callback) {
		
		console.log('Incoming request: PUT');
		console.log('Request body: ', req.body);
		
		var Restaurant = mongoose.model("restaurant", RestaurantSchema);
		Restaurant.findOne(target, function(err, result) {
			if(err)
				console.log("Find Document Update Error: " + err.message);
			else {	
				result.address.building = req.query.building;
				result.address.street = req.query.street;
				result.address.zipcode = req.query.zipcode;
				result.address.coord = [req.query.lon, req.query.lat];
				result.name = req.query.name;
				result.cuisine = req.query.cuisine;
				result.borough = req.query.borough;
				result.restaurant_id = req.query.id;
				
				console.log(result);	
				// able to update but can't show the word in webpage and cmd
				result.save(function(err) {
					if (err) {
						console.log("Error: " + err.message);
						res.status(500).json(err);
					}
					else {
						console.log('Updated: ', result._id);
						res.status(200).json({Message: 'Update Done', id: req.body.id});
						
					}
				});
			}
		db.close();
		});
	});
}); // updateRestaurant

app.get('/display', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: " ));
	db.once('open', function(callback) {
		
		console.log('Incoming request: GET');
		
		var Restaurant = mongoose.model('restaurant', RestaurantSchema);
		var criteria = {};

		console.log(req.query);
		
		//Address
		if(req.query.building)
			criteria = {"address.building": req.query.building};
		if(req.query.street)
			criteria = {"address.street": req.query.street};
		if(req.query.zipcode)
			criteria = {"address.zipcode": req.query.zipcode};
		if(req.query.lon)
			criteria = {"address.coord": req.query.lon};
		if(req.query.lat)
			criteria = {"address.coord": req.query.lat};
		if(req.query.lon && req.query.lat)
			criteria = {"address.coord": [req.query.lon, req.query.lat]};		
		
		// not problem
		//Borough
		if(req.query.borough)
			criteria.borough = req.query.borough;
		//Cuisine
		if(req.query.cuisine)
			criteria.cuisine = req.query.cuisine;
		//Restaurant_id
		if(req.query.restaurant_id)
			criteria.restaurant_id = req.query.restaurant_id;
		//Name
		if(req.query.name)
			criteria.name = req.query.name;		
		
		console.log(criteria);
	
		Restaurant.find(criteria, function(err, results) {
			if(err) {
				console.log("ERROR: " + err.message);
				res.end('Connection closed',400);
			}
			else {
				console.log("FOUND RESULT:" + results.length);
				if(results) {			
					res.writeHead(200,{"Content-Type": "applcation/json"});
					res.write(JSON.stringify(results));
					res.end('Connection closed',200);
				}				
			}
			db.close();
		});	
	});	
}); // displayRestaurant

app.listen(process.env.PORT||8099);