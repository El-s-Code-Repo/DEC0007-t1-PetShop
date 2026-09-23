// Source - https://stackoverflow.com/a/49400334
// Posted by Matt, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-23, License - CC BY-SA 4.0
import {MongoClient} from "mongodb";

export class Connection {

    static async open() {
        if (this.mongoclient) return this.mongoclient
        this.mongoclient = await MongoClient.connect(this.url)
        this.db = await this.mongoclient.db("PetShop")
        this.clients = await this.db.collection('clients')
        this.appointments = await this.db.collection('appointments')
        return this.db
    }

}
//var client = new MongoClient("mongodb://127.0.0.1:50000");
//   await client.connect();
//   db = await client.db("AGENDA");
//   alunos = await db.collection("alunos");
Connection.db = null
Connection.url = 'mongodb://127.0.0.1:27017/'
// Connection.options = {
//     bufferMaxEntries:   0,
//     reconnectTries:     5000,
//     useNewUrlParser:    true,
//     useUnifiedTopology: true,
// }


// if this breaks use https://stackoverflow.com/a/62169471


