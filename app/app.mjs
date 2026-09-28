import express from "express";
import {engine} from "express-handlebars";
import {Connection} from "./model/connector.mjs";
import {
    renderAppointmentList,
    renderScheduleConfig,
    handleScheduleConfigUpdate
} from "./controller/adminController.mjs";
import {handleClientBooking} from "./controller/clientController.mjs";
import {renderClientHome} from "./view/renderClient.mjs";

let app = express();

app.use(express.static("./static"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.engine("handlebars", engine({
    defaultLayout: "main",
    layoutsDir: "./templates/layouts",
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./templates");

const PORT = 3000;

app.get("/", renderClientHome);
app.post("/", handleClientBooking);

app.get("/listaPetAgenda", renderAppointmentList);

app.get("/ajustaPetAgenda", renderScheduleConfig);
app.post("/ajustaPetAgenda", handleScheduleConfigUpdate);


async function startServer() {
    await Connection.open();
    try {
        await Connection.db.command({ping:1}).then(value => {if(value.ok === 1){
            console.log(`Connected to MongoDB (${Connection.db.databaseName})`);
        }}) //test connection

        app.listen(PORT, function () {
            console.log("waiting for people... @ " + PORT);
        });

    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}


await startServer(); //Needs to await otherwise the connection is closed
