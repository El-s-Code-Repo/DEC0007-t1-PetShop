import express from "express";
import {engine} from "express-handlebars";
import {Connection} from "./model/connector.mjs";
import {renderScheduleConfig, handleScheduleConfigUpdate} from "./controller/adminController.mjs";
import {renderClientHome, handleClientBooking} from "./controller/clientController.mjs";

let app = express();

app.use(express.static("./app/view/static"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.engine("handlebars", engine({
    defaultLayout: "main",
    layoutsDir: "./app/view/layouts",
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./app/view");

const PORT = 3000;

app.get("/", renderClientHome);
app.post("/", handleClientBooking);

app.get("/ajustaPetAgenda", renderScheduleConfig);
app.post("/ajustaPetAgenda", handleScheduleConfigUpdate);

async function startServer() {
    try {
        await Connection.open();
        console.log("Connected to MongoDB (PetShop)");
        app.listen(PORT, function () {
            console.log("waiting for people... @ " + PORT);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

startServer();