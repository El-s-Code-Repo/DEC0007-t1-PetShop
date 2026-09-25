import express from "express"
import {engine} from "express-handlebars";
import {Appointment, Client} from "./model/models.mjs";
import {addAppointment, addClientIfNotExists, getClientByCPF} from "./model/handlers.mjs";
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

//Numbers 0-5 are monday to saturday
//Numbers 0-7 are the timeslots for that day (8,9,10,11,14,15,16,17)
//the number in that slot is how many slots are available at that day and at that hour
//ex. timeTable[0][1] gets the number of available slots at monday,9Am
//TODO turn this into a class
let timeTable = {
    '0': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
    '1': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
    '2': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
    '3': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
    '4': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
    '5': {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,},
}
//

let booleanPromise = Connection.db.dropDatabase();
console.log(booleanPromise)
let testClient = new Client("JohnDoe", 123456789123)
let testAppointment = new Appointment(Date.now(),testClient)

await addClientIfNotExists(testClient)
console.log(await getClientByCPF(123456789123))
await addClientIfNotExists(testClient)
await addAppointment(testAppointment)

await Connection.mongoclient.close()

let test = {}

test[0]={}
test[1]={}
test[0][0]=0
test[0][1]=1
console.log(test)