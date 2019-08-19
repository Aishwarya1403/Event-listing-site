var bodyParser = require ("body-parser"), 
	mongoose= require("mongoose"),
	express= require ("express"),
	methodOverride = require("method-override"),
	app = express(),
	passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user");
    

//APP CONFIG
mongoose.connect("mongodb://localhost/website",{ useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:"true"}));


app.use(require("express-session")({
    secret: "This is the events listing app",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

var eventSchema= new mongoose.Schema({
	eName : String,
	eDate : String,
	ePlace: String,
	ePrice: String,
	eDesc : String,
	eImg  : String
});

var event = mongoose.model("event", eventSchema);


app.get("/", function(req,res){
	event.find({},function(err,event){
		if(err){
			console.log("ERROR");
		}
		else{
			res.render("showEvents",{details:event});
		}
	});
});	

app.get("/events" , function(req,res){
	event.find({},function(err,event){
		if(err){
			console.log("ERROR");
		}
		else{
			res.render("showEvents",{details:event});
		}
	});
});

app.post("/events", function(req,res){
	event.create(req.body.event, function(err,newEvents){
		if(err){
			res.render("addEvents");
		}
		else{
			res.redirect("/events");
		}
	});
});

app.get("/addEvents", isLoggedIn, function(req,res){
	res.render("addEvents");
});

app.get("/events/:id", function(req,res){
	event.findById(req.params.id,function(err,foundEvent){
		if(err){
			console.log(err);
		}
		else{
		res.render("edetails",{event:foundEvent});
		}
	});
});

app.delete("/events/:id", isLoggedIn,function(req,res){
	event.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/events");
       } else {
           res.redirect("/events");
       }
   })
});

app.get("/register", function(req,res){
	res.render("register");
});

app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/events"); 
        });
    });
});

app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/events",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/events");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};


app.listen(3000, function(){
	console.log("server has started");
});