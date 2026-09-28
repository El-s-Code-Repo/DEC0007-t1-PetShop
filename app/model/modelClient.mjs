// @ts-check
import {Connection} from "./connector.mjs";

export class Client {
    /**
     * @param {String} Name
     * @param {String|Number} cpf
     * @param {any} _id
     */
    constructor(Name, cpf, _id = "") {
        if (!Name || String(Name).trim() === "") {
            throw "No Name provided";
        }
        if (cpf === undefined || cpf === null || String(cpf).trim() === "") {
            throw "No CPF provided";
        }

        this.name = String(Name).trim();
        this.cpf = String(cpf).trim();
        this._id = _id;
    }

    toJSON() {
        return {
            name: this.name,
            cpf: this.cpf,
        };
    }

    async save() {
        try {
            let data = await Connection.clients.updateOne(
                {cpf: this.cpf},
                {$set: {name: this.name, cpf: this.cpf}},
                {upsert: true}
            );
            if (data.upsertedId != null) {
                this._id = data.upsertedId;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * @param {String|Number} cpf
     * @param {String} name
     * @returns {Promise<Client>}
     */
    static async get(name, cpf) {
        let testClient = await Client.getClientByCPF(cpf);

        if (testClient != null) {
            return new Client(testClient.name, testClient.cpf, testClient._id);
        } else {
            return new Client(name, cpf);
        }
    }

    /**
     * @param {String|Number} cpf
     */
    static async getClientByCPF(cpf) {
        const normalizedCpf = String(cpf).trim();
        let clientData = await Connection.clients.findOne({cpf: normalizedCpf});
        if (clientData != null) {
            return new Client(clientData.name, clientData.cpf, clientData._id);
        } else {
            return null;
        }
    }
}