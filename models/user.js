//schema for tracking users
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//for using passport middleware for authentication
//local strategy for authentication
var passportLocalMongoose = require('passport-local-mongoose');

//with mongoose population, it will have firstname and lastname apart from username and password
var User = new Schema ({
    email: {
        type: String
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    polls: [{ type: mongoose.Schema.Types.ObjectId, ref: "Poll" }],
    },
    { timestamps:true }
);


//without mongoose population
//using passport-local-mongoose
/*var User = new Schema ({

    //only admin is included here, all other things will be included by passportlocalmongoose plugin
    admin: {
        type:Boolean,
        default: false
    }
});*/

//for including required things in schema 
//it will add username and hashed passport support and also add many function support
User.plugin(passportLocalMongoose);


/*var User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:  {
        type: String,
        required: true
    },
    admin:   {
        //this for differentiating between normal and admin user
        //set default false as for normal user
        type: Boolean,
        default: false
    }
});*/

module.exports = mongoose.model('User', User);