// @ts-check
import {Connection} from "./connector.mjs";


/**
 * @param {Client}client*/
// export async function addClientIfNotExists(client){
//     let testClient = await getClientByCPF(client.cpf);
//
//     if(testClient !=null){
//         console.log("did not inset, client already exists")
//         return;
//     }
//
//     try {
//         await Connection.clients.insertOne(client.toJSON());
//     }catch(err) {
//         console.log(err);
//     }
//     console.log("inserted client");
// }

export class Client {
    /**
     * @param {String}Name
     * @param {Number}cpf
     * @param {String}_id
     */
    constructor(Name,cpf,_id = "") {
        if(Name === ""){
            throw "No Name provided"
        }


        this.name = Name;
        this.cpf = cpf;
        this._id = _id
    }

    // toJSON(){
    //     return {
    //         name: this.name,
    //         cpf: this.cpf,
    //     }
    // }

    async save(){
        try{
            let data = await Connection.clients.updateOne({cpf:this.cpf},{$set:{name:this.name,cpf:this.cpf}},{ upsert: true })
            if(data.upsertedId != null) {
                this._id = data.upsertedId;
            }
        }catch (err){console.log(err)}

    }


    /**
     * @param {Number}cpf
     * @param {String}name
     * @returns {Client}
     */
    static async get(name,cpf){
        let testClient = await Client.getClientByCPF(cpf);

        if(testClient !=null){
            return new Client(testClient.name,testClient.cpf,testClient._id);
        }else{
            return new Client(name,cpf)
        }
    }

    /**
     * @param {Number}cpf
     * */
    static async getClientByCPF(cpf) {
        let clientData = await Connection.clients.findOne({cpf: cpf});
        if (clientData != null) {
            return new Client(clientData.name, clientData.cpf, clientData._id);

        } else return null;
    }




}
// An appointment is a client and a date
export class Appointment {
    /**
     * @param {Number}appointmentTime
     * @param {Client}client*/

    constructor(appointmentTime,client) {
        this.time = appointmentTime;
        this.client = client;
    }
    toJSON(){
        return {
            dateMs:this.time,
            clientCPF:this.client.cpf
        }
    }
}