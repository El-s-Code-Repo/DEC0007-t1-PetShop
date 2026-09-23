import express from "express"
import {engine} from "express-handlebars";

let app = express()

app.use(express.static("./static"))
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

const PORT = 3000

app.get("/",function (req,res) {
    res.status(200).json({
        message:"Running A-OK",
        page:"CLIENT: Homepage",
    })
}
)




app.listen(PORT, function (){
    console.log("waiting for people... @ " + PORT)

})