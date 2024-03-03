const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const FavouriteSchema = new Schema({
    user: {type:mongoose.Schema.Types.ObjectId, required:true},
    food: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Food'},
    photos: [String],
    name: {type:String, required:true},
    
});



module.exports = mongoose.model('Favourite', FavouriteSchema);
