var express = require('express');
var async = require("async");

var mongoose = require('mongoose');               // mongoose for mongodb
var database = require('../config/database');     // load the database config

var User = require('../models/UserLogin');
// var Status = require('../models/UserStatus');
var router = express.Router();


function handle_database(req, type, callback) {
   async.waterfall([
    function(callback) {
    	  // connect to mongoDB database on modulus.io
        mongoose.connect(database.url, function(err, connection) {
          if(err) {
            // if there is error, stop right away.
            // This will stop the async code execution and goes to last function.
            callback(true);
          } else {
            callback(null,connection);
          }
        });
    },
    function(connection, callback) {
      switch(type) {
       	case "login" :
        	var query = User.find({
              user_email : req.body.email,
              user_password : req.body.password
            });
        break;
        case "register" :
      		var query = User.create({
            user_email : req.body.user_email,
            user_name : req.body.user_name,
            user_password : req.body.user_password
    			});
        break;
        case "checkEmail" :
         var query = User.find({
              user_email : req.body.user_email,
          });
        break;
        case "addStatus" :
          var query = User.findOne({ user_email: req.session.key }).status.push({status : req.body.status});
        break;
        case "getStatus" :
          var query = User.findOne({ user_email: req.session.key }).populate('UserStatus');
        break;
        default :
        break;
	    }
      callback(null, query);
    },
	    function(query, callback) {
        query.exec(function(err, rows) {
	        if(!err) {
	            if(type === "login") {
	              callback(rows.length === 0 ? false : rows[0]);
	            } else if(type === "getStatus") {
                callback(rows.length === 0 ? false : rows);
              } else if(type === "checkEmail") {
                callback(rows.length == 0 ? false : true);
              } else {
                callback(false);
	            }
	        } else {
	             // if there is error, stop right away.
	            // This will stop the async code execution and goes to last function.
	            callback(true);
	         }
	      });
      }
   ],
    function(result){
      if(typeof(result) === "boolean" && result === true) {
        callback(null);
      } else {
        callback(result);
      }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {

  //Session set when user Request our app via URL
	sess=req.session;

	if(sess.email)
	{
		/*
		* This line check Session existence.
		* If it existed will do some action.
		*/
		res.redirect('/admin');
	}
	else{
	    res.render('index', { title: 'Express' });
	}

});

router.post('/login',function(req,res) {
	handle_database(req,"login",function(response) {
        if(response === null) {
            res.json({"error" : "true","message" : "Database error occured"});
        } else {
            if(!response) {
              	res.json({
	                     "error" : "true",
	                     "message" : "Login failed ! Please register"
	                   });
            } else {
               	req.session.key = response.user_email;
                res.json({"error" : false,"message" : "Login success."});
            }
        }
    });
});

router.get('/admin',function(req,res){
	sess=req.session;

	if(sess.key)
	{
		res.write('<h1>Hello '+sess.key+'</h1>');
		res.write('<a class="btn tbn-info" href="/addstatus">AddStatus</a>');
		res.end('<a href="/logout">Logout</a>');
	}
	else
	{
		res.write('<h1>Please login first.</h1>');
		res.end('<a href="/login">Login</a>');
	}

});

router.get('/home',function(req,res){
    if(req.session.key) {
        res.render("home",{ title : "Status List", email : req.session.key["user_name"]});
    } else {
        res.redirect("/");
    }
});

router.get("/fetchStatus",function(req,res){
  if(req.session.key) {
    handle_database(req,"getStatus",function(response){
      if(!response) {
        res.json({"error" : false, "message" : "There is no status to show."});
      } else {
        res.json({"error" : false, "message" : response});
      }
    });
  } else {
    res.json({"error" : true, "message" : "Please login first."});
  }
});

router.post("/addStatus",function(req,res){
    if(req.session.key) {
      handle_database(req,"addStatus",function(response){
        if(!response) {
          res.json({"error" : false, "message" : "Status is added."});
        } else {
          res.json({"error" : false, "message" : "Error while adding Status"});
        }
      });
    } else {
      res.json({"error" : true, "message" : "Please login first."});
    }
});

router.post("/register", function(req, res) {
    handle_database(req,"checkEmail",function(response) {

      if(response === null) {
        res.json({"error" : true, "message" : "This email is already present"});
      } else {
        handle_database(req, "register", function(response) {
          if(response) {
            res.json({"error" : true, "message" : "Error while adding user."});
          } else {
            res.json({"error" : false, "message" : "Registered successfully."});
          }
        });
       }
    });
});

router.get('/logout',function(req,res){

	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/');
		}
	});
});

module.exports = router;