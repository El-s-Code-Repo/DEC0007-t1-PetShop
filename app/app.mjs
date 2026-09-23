import express from "express"
import {engine} from "express-handlebars";
import {Appointment, Client} from "./model/models.mjs";
import {addAppointment, addClientIfNotExists} from "./model/handlers.mjs";
import {Connection} from "./model/connector.mjs";
let app = express()

app.use(express.static("./static"))
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

//@ts-check

// This should go in the app/server setup, and waited for.
await Connection.open()

// const PORT = 3000

app.get("/",function (req,res) {
    res.status(200).json({
        message:"Running A-OK",
        page:"CLIENT: Homepage",
    })
}
)


//
//
// app.listen(PORT, function (){
//     console.log("waiting for people... @ " + PORT)
//
// })

let testClient = new Client("JohnDoe", 123456789123)
let testAppointment = new Appointment(Date.now(),testClient)

await addClientIfNotExists(testClient)
await addAppointment(testAppointment)

await Connection.mongoclient.close()