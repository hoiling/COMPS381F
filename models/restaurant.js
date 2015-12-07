var mongoose = require('mongoose');

var restaurantSchema = mongoose.Schema({
    address : {
        street: {type: String},
        zipcode: {type: String},
        building: {type: String},
        coord: {type: [Number,Number]}
        },
    borough: {type: String},
    cuisine: {type: String},
    grades: [{date: {type: String}, grade: {type: String}, score: {type: Number}}],
    name: {type: String},
    restaurant_id: {type: String},
});

module.exports = restaurantSchema;
