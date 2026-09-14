console.log("Hello World")
import express from "express"

var app = express()

app.use(express.static("./static"))


app.get("/",function (req,res) {
    res.status(200).json({
        message:"Running A-OK"
    })
})


app.listen(3000, function (){
    console.log("waiting for people...")

})