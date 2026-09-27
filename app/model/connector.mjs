// Source - https://stackoverflow.com/a/49400334
// Posted by Matt, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-23, License - CC BY-SA 4.0
import {MongoClient} from "mongodb";

export class Connection {
    /** @type {import("mongodb").Collection<any>} */
    static clients;

    /** @type {import("mongodb").Collection<any>} */
    static appointments;

    /** @type {import("mongodb").Collection<any>} */
    static timetable;

    static async open() {
        if (this.mongoclient) return this.db;
        this.mongoclient = await MongoClient.connect(this.url);
        this.db = await this.mongoclient.db("PetShop");
        this.clients = await this.db.collection('clients');
        this.appointments = await this.db.collection('appointments');
        this.timetable = await this.db.collection('timetable');
        return this.db;
    }

}

Connection.mongoclient = null;
Connection.db = null;
Connection.url = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/';