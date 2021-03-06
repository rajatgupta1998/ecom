var passport=require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local');

// store in session serialise by id
passport.serializeUser(function(user, done){
    done(null, user.id); // null for the first case
}); 

// deserialise
passport.deserializeUser(function(id, done){
    User.findById(id, function(err,user){
        done(err, user);
    });
});

// create user using local strategy middleware
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
   // passReqToCall: true
}, function(email, password, done){ // req param ? bigHack
   // req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err);
        }
        if (user){
            return done(null, false, {message: 'Already used email'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err,result){
            if(err)
            {
                return done(err);
            }
            return done(null, newUser);
        })
    });
}
));

// sigin strategy
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // passReqToCallback: true
}, function( email,password,done){
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err);
        }
        if (!user){
            return done(null, false, {message: 'No such email'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'No such password'});
        }
        return done(null, user);
    });

}));