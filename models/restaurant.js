var mongoose = require('mongoose');

var restaurantSchema = mongoose.Schema({
    address : {
        street: {type: String, required: true},
        zipcode: {type: String, required: true},
        building: {type: String, required: true},
        coord: {type: [Number,Number], require: true}
        },
    borough: {type: String, required: true},
    cuisine: {type: String, required: true},
    grades: [{date: {type: String, required: true}, grade: {type: String, required: true}, score: {type: Number, require: true}}],
    name: {type: String, required: true},
    restaurant_id: {type: String, required: true},
});

module.exports = restaurantSchema;
