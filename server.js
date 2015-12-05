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
		input.restaurant_id = req.body.id;
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
						console.log("\n Restaurant is created");
						res.status(200).send("\nInsert restaurant done, id: "+ input.restaurant_id + "\n");						
					}
				});	
			}
			else {
				db.close();
				console.log("Error: Input data length is different");
				res.status(200).send('Input data length is different \n');
			}			
		}
		else {
			db.close();
			console.log("Error: Missing input data");
			res.status(200).send('Missing input data \n');
		}
	});
}); // createRestaurant

app.delete('/delete/:id', function(req, res) {
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
				res.status(200).send("Delete Done, id: " + req.params.id + "\n");
			}
		});		
	});		
}); // delete

app.delete('/delete/grades/:id', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Connection ERROR: '));
	db.once('open', function(callback) {		
		console.log('Incoming request: DELETE');
		console.log('Request body: ', req.body);
		var Restaurant = mongoose.model("restaurant", RestaurantSchema);
		var id = req.params.id;
		var criteria = "";
		var date = "";
		var grade = "";
		var score = "";
		if(req.body.date) {
			date += '"date": "' + req.body.date + '"';
			criteria += date;
		}
		if(req.body.grade) {
			grade = '"grade": "' + req.body.grade + '"';
			if(criteria)
				criteria += ', ' + grade;
			else
				criteria += grade;
		}
		if(req.body.score) {
			score = '"score": ' + req.body.score;
			if(criteria)
				criteria += ', ' + score;
			else
				criteria += score;
		}
		console.log(criteria);
		var obj = JSON.parse('{"grades": ' + '{' + criteria + '}}');
		console.log(obj);
		
		Restaurant.update({restaurant_id: id}, {$pull: obj}, function(err, result) {
			if (err) {
				console.log("Error: " + err.message);
				res.status(500).json(err);
			}
			else {
				res.status(200).send('Update Id: ' + id + " is successed. \n");
			}
			db.close();
		});
	});
}); // delete/grades

app.put('/update/:id', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Connection ERROR: '));
	db.once('open', function(callback) {		
		console.log('Incoming request: PUT');
		console.log('Request body: ', req.body);
		var Restaurant = mongoose.model("restaurant", RestaurantSchema);
		var id = req.params.id;
		var criteria = "";
		var building = "";
		var street = "";
		var zipcode = "";
		var name = "";
		var borough = "";
		var cuisine = "";
		
		if(req.body.name) {
			name = '"name": "' + req.body.name +'"';
			criteria += name;
		}
		if(req.body.borough) {
			borough = '"borough": "' + req.body.borough +'"';
			if(criteria)
				criteria += ", " + borough;
			else
				criteria += borough;
		}
		if(req.body.cuisine) {
			cuisine = '"cuisine": "' + req.body.cuisine +'"';
			if(criteria)
				criteria += ", " + cuisine;
			else
				criteria += cuisine;
		}
		if(req.body.building) {
			building += '"address.building": "' + req.body.building +'"';
			if(criteria)
				criteria += ", " + building;
			else
				criteria += building;
		}
		if(req.body.street) {
			street += '"address.street": "' + req.body.street +'"';
			if(criteria)
				criteria += ", " + street;
			else
				criteria += street;
		}
		if(req.body.zipcode) {
			zipcode += '"address.zipcode": "' + req.body.zipcode +'"';
			if(criteria)
				criteria += ", " + zipcode;
			else
				criteria += zipcode;
		}
		
		if(req.body.lon || req.body.lat) {
			if(req.body.lon && req.body.lat) {
				var coord = '"address.coord": [' + req.body.lon +', ' + req.body.lat + ']';
				var obj = JSON.parse('{' + criteria + ', ' + coord + '}');
				console.log(obj);
				Restaurant.update({restaurant_id: id}, {$set: obj}, function(err, result) {
					if (err) {
						console.log("Error: " + err.message);
						res.status(500).json(err);
					}
					else {
						console.log("Update is successed \n");
						res.status(200).send('Update Id: ' + id + " is successed. \n");
					}
				db.close();
				});
			}
			else {
				console.log("One of coordination is missing \n");
				res.status(400).send("One of coordination is missing \n");
				db.close();
			}
		}
		else {
			var obj = JSON.parse('{' + criteria +'}');
			console.log(obj);
			Restaurant.update({restaurant_id: id}, {$set: obj}, function(err, result) {
			if (err) {
				console.log("Error: " + err.message);
				res.status(500).json(err);
			}
			else {
				console.log("Update is successed \n");
				res.status(200).send('Update Id: ' + id + " is successed. \n");
			}
			db.close();
			});
		}		
	});	
}); // update (expected coord and grades)

app.put('/update/grades/:id', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: "));
	db.once('open', function(callback) {
		console.log('Incoming request: PUT');
		console.log('Request body: ', req.body);
		var Restaurant = mongoose.model("restaurant", RestaurantSchema);
		var id = req.params.id;
		var search = "";
		var criteria = "";
		if(req.body.orignalDate || req.body.orignalGrade || req.body.orignalScore) {
			if(req.body.orignalDate)
				search += '"grades.date": "' + req.body.orignalDate + '"';
			if(req.body.orignalGrade) {
				if(search)
					search += ', "grades.grade": "' + req.body.orignalGrade + '"';
				else
					search += '"grades.grade": "' + req.body.orignalGrade + '"';
			}
			if(req.body.orignalScore) {
				if(search)
					search += ', "grades.score": ' + req.body.orignalScore;
				else
					search += '"grades.score": ' + req.body.orignalScore;
			}
			
			var obj = JSON.parse('{"restaurant_id": "' + id + '", ' + search + '}');
			console.log(obj);
			
			if(req.body.date && req.body.grade && req.body.score) {
				criteria = JSON.parse('{"grades.$": {"date": "' + req.body.date +'", "grade": "' + req.body.grade + '", "score": ' + req.body.score + '}}');
				console.log(criteria);
				
				Restaurant.update(obj, {$set: criteria}, function(err, result) {
					if (err) {
						console.log("Error: " + err.message);
						res.status(500).json(err);
					}
					else {
						res.status(200).send('Update Id: ' + id + " grades update is successed. \n");
					}
				db.close();
				});
			}
			else {
				console.log("One of grades information is missing \n");
				res.status(400).send("One of grades information is missing \n");
				db.close();
			}	
		}
		else {
			if(req.body.date && req.body.grade && req.body.score) {
				criteria = JSON.parse('{"grades": {"date": "' + req.body.date +'", "grade": "' + req.body.grade + '", "score": ' + req.body.score + '}}');
				Restaurant.update({restaurant_id: id}, {$push: criteria}, function(err, result) {
					if (err) {
						console.log("Error: " + err.message);
						res.status(500).json(err);
					}
					else {
						res.status(200).send('Update Id: ' + id + " grades update is successed. \n");
					}
				db.close();
				});
			}
			else {
				console.log("One of grades information is missing \n");
				res.status(400).send("One of grades information is missing \n");
				db.close();
			}	
		}		
	});	
}); // update/grades

app.get('/display', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: "));
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
					res.status(200);
				}				
			}
			db.close();
		});	
	});	
}); // displayRestaurant

app.listen(process.env.PORT||8099);