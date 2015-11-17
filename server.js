var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mongodbURL = 'mongodb://hoiling:123456@ds053894.mongolab.com:53894/comps381f';

var RestaurantSchema = require('./models/restaurant');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/create', function(req, res) {
	res.sendFile(__dirname + '/public/create.html');
});

app.get('/display', function(req, res) {
	res.sendFile(__dirname + '/public/display.html');
});

// done
app.post('/createRestaurant', function(req, res) {	
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.open('error', console.error.bind(console, "Connection ERROR: " ));
	db.once('open', function(callback) { // open once
		// use model
		var Restaurant = mongoose.model('restaurant', RestaurantSchema);
		// create insert format
		var input = {address: {building: "", street: "", zipcode:"", coord: [],}, 
							borough: "", cuisine: "", restaurant_id: "", name: ""};
		
		var data = '';
		req.on('data', function(chunk) {
			data += chunk;
		}); // end req.on()
		req.on('end', function() {
			console.log("POST Data: " + data);
			var FirstSplit = data.split('&');
			for (var i = 0; i < FirstSplit.length; i++) {
				var pair = FirstSplit[i].replace('+', ' '); // replace + to space >> " " when user type space
				var pair = pair.split('=');
				if (pair[0] == "building") {
					input.address.building = pair[1];
				}
				if (pair[0] == "street") {
					input.address.street = pair[1];
				}
				if (pair[0] == "zipcode") {
					input.address.zipcode = pair[1];
				}
				if (pair[0] == "lon") {
					input.address.coord[0] = pair[1];
				}
				if (pair[0] == "lat") {
					input.address.coord[1] = pair[1];
				}
				if (pair[0] == "borough") {
					input.borough = pair[1];
				}
				if (pair[0] == "cuisine") {
					input.cuisine = pair[1];
				}
				if (pair[0] == "id") {
					input.restaurant_id = pair[1];
				}
				if (pair[0] == "name") {
					input.name = pair[1];
				}
			}
			console.log(input);
			var newRestaurant = new Restaurant(input);
			newRestaurant.save(function(err) {
				if(err) 
					console.log("ERROR: " + err.message);
				else {
					console.log("Restaurant is created");
					res.writeHead(200, {"Content-Type": "text/html"});
					res.write("<html><head><title>Create Success</title></head>");
					res.write("<body><H1>Create Successful</H1>");
					res.write('<a href="/">Go Home</a></body></html>');
					res.end();				
				}
			db.close();
			}); // newRestaurant save	
		}); // end req.on()				
	});	
}); // post /createRestaurant


// done but have error
app.get('/removeRestaurant', function(req,res) {
	//console.log("/deleteKitty: " + JSON.stringify(req.query.id));
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: "));
	db.once('open', function (callback) {
		var Restaurant= mongoose.model('restaurant', RestaurantSchema);
		if (Array.isArray(req.query.id)) { //multiple checkbox select
			// req.query.id is an array
			for (var i=0; i<req.query.id.length; i++) {
				var target = {_id: ""};
				target._id = req.query.id[i];
				console.log("Removing " + target._id + "...");
				Restaurant.find(target).remove(function(err) {
					if (err) {
						console.log("Error: " + err.message);
						res.write(err.message);
					}
					else {
						console.log("Removed: " + target._id);
						
					}
				});
			}
			res.write("<html><body><h1>Remove done!</h1>");
			db.close();
		}
		else if (req.query.id) {  // single checkbox select
			var target = {_id: ""};
			target._id = req.query.id;
			Restaurant.find(target).remove(function(err) {
				if (err) {
					console.log("Error: " + err.message);
					res.write(err.message);
				}
				else {
					console.log("Deleted: " + target._id);		
				}
			});
			res.write("<html><body><h1>Remove done!</h1>");
			db.close();
		}
		else { // nothing has selected
			res.write("<html><body><h1>None selected!</h1>");			
			db.close();
		}
		res.write('<br><a href="/">Go Home</a></body></html>');
		res.end();
	});
});

app.get('/editRestaurant', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, "Connection ERROR: "));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('restaurant', RestaurantSchema);
		var target = {_id: ""};
		target._id = req.query.id;
		Restaurant.findOne(target, function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				db.close();
				console.log(results);
				res.render('editRestaurant',{restaurant: results});
			}
			res.end();
		});
	});
}); // editRestaurant

app.get('/updateRestaurant', function(req, res) {
	console.log(req.query);

});

app.get('/displayRestaurant', function(req, res) {
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.open('error', console.error.bind(console, "Connection ERROR: " ));
	db.once('open', function(callback) {
		var Restaurant = mongoose.model('restaurant', RestaurantSchema);
		var criteria = {};

		console.log(req.query);
		
		//Address these will copy the front
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
				res.write(err.message);
			}
			else {
				console.log("FOUND RESULT:" + results.length);
				if(results) {			
					res.render('displayResult', {restaurant: results});
					res.end();
				}				
			}
			db.close();
		});
	
	});	
}); // end of read

app.listen(process.env.PORT||8099);