const express = require("express")
const bodyParser = require("body-parser")
var cors = require("cors")
const morgan = require("morgan")
const Song = require("./models/songs")
const jwt = require("jwt-simple")
const User = require("./models/user")
const { restart } = require("nodemon")


const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(morgan('combined'))


const router = express.Router();
const secret = "supersecret"

//route creates a new username and password (aka a new User)
router.post("/user", (req,res) =>{
    //see if the request has a username and password...if not exit function
    if(!req.body.username || !req.body.password){
        res.status(400).json({error: "Missing username and password"})
        return
    }
    //create constant of newUser equal to the data the request send from the front-end
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        status: req.body.status
    })
    //save the user to the database.  if errors, send status along with err message..otherwise send ok status
    newUser.save(function(err){
        if(err){
            res.status(400).send(err)
        }
        else{
            res.sendStatus(201)
        }
    })

})

router.post("/auth", function(req, res) {

    if (!req.body.username || !req.body.password) {
       res.status(401).json({ error: "Missing username and/or password"});
       return;
    }
 
    // Get user from the database
    User.findOne({ username: req.body.username }, function(err, user) {
       if (err) {
          res.status(400).send(err);
       }
       else if (!user) {
          // Username not in the database
          res.status(401).json({ error: "Bad username"});
       }
       else {
          // Check if password from database matches given password
          if (user.password != req.body.password) {
             res.status(401).json({ error: "Bad password"});
          }
          else {
             // Send back a token that contains the user's username
             const token = jwt.encode({ username: user.username }, secret);
             res.json({ token: token });
          }
       }
    });
 });



app.get('/', (req,res) =>{
    res.send('Hello from my server')
})

//grab all songs
router.get("/songs", (req,res) => {
    Song.find((err,songs) =>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.json(songs)
        }
    })

})

//Add song to database
router.post("/songs", (req,res) => {
    const song = new Song(req.body)
    song.save((err,song) =>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.status(200).json(song)
        }
    })
})

//Use the ID in the URL path to find a single song
router.get("/songs/:id", function(req,res){
    Song.findById(req.params.id, function(err,song){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(song);
        }
    });
});

//update or edit a song

router.put("/songs/:id", function(req, res) {
    // Song to update sent in body of request
    const song = req.body;
 
    // Replace existing song fields with updated song
    Song.updateOne({ _id: req.params.id }, song, function(err, result) {
       if (err) {
          res.status(400).send(err);
       } 
       else if (result.n === 0) {
           res.sendStatus(404);
       } 
       else {
           res.sendStatus(204);
       }
    });
 });

//delete a song
router.delete("/songs/:id",(req,res) =>{
    Song.deleteOne({_id: req.params.id}, (err,result) =>{
        if(err){
            res.status(400).send(err)
        }
        else if(result.n === 0){
            res.sendStatus(404)
        }
        else{
            res.sendStatus(204)
        }

    })
})

app.use("/api",router)

app.listen(process.env.PORT || 3000)
