const express = require("express")
const bodyParser = require("body-parser")
var cors = require("cors")
const morgan = require("morgan")
const Song = require("./models/songs")


const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(morgan('combined'))


const router = express.Router();



app.get('/', (req,res) =>{
    res.send('Hello from my server')
})

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

app.use("/api",router)

app.listen(process.env.PORT || 3000)
