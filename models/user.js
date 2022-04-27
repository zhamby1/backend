const db = require("../db")

//Create a model from a schema for the user
const User = db.model("User",{
    username: {type: String, required:true},
    password: {type: String, required:true},
    staus: String
})

module.exports = User;