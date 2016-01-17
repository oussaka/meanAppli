// grab the things we need
var mongoose = require('mongoose');
// var UserStatus = require('./UserStatus');
var Schema = mongoose.Schema;

var childSchema = new Schema({ name: 'string' });

// create a schema
var userSchema = new Schema({
  user_email : {type : String, required: true, unique: true},
  user_name : {type : String, required: true},
  user_password : {type : String, required: true}
  created_at : Date
});

// on every save, add the date
userSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  // this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// the schema is useless so far
// we need to create a model using it
var UserLogin = mongoose.model('UserLogin', userSchema);

// make this available to our users in our Node applications
module.exports = UserLogin;