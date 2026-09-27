// @ts-check
import {Connection} from "./connector.mjs";

export const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const SERVICE_HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

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
            await Connection.open();
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
        await Connection.open();
        const normalizedCpf = String(cpf).trim();
        let clientData = await Connection.clients.findOne({cpf: normalizedCpf});
        if (clientData != null) {
            return new Client(clientData.name, clientData.cpf, clientData._id);
        } else {
            return null;
        }
    }
}

// An appointment is a client and a date
export class Appointment {
    /**
     * @param {Number} appointmentTime
     * @param {Client} client
     */
    constructor(appointmentTime, client) {
        this.time = Number(appointmentTime);
        this.client = client;
    }

    toJSON() {
        return {
            dateMs: this.time,
            clientCPF: this.client.cpf
        };
    }
}

// Weekly capacity configuration table (PDF Section 1.1 & 3.2)
export class TimeTable {
    /**
     * @param {Object.<string, Object.<string, number>>} [schedule]
     */
    constructor(schedule) {
        this.schedule = schedule || TimeTable.getDefaultSchedule();
    }

    static getDefaultSchedule() {
        return {
            "Segunda": {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 1, "15:00": 1, "16:00": 1, "17:00": 1},
            "Terça":   {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            "Quarta":  {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 1, "15:00": 1, "16:00": 1, "17:00": 1},
            "Quinta":  {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            "Sexta":   {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            "Sábado":  {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 0, "15:00": 0, "16:00": 0, "17:00": 0}
        };
    }

    toJSON() {
        return {
            configId: "weekly_default",
            schedule: this.schedule
        };
    }

    static async get() {
        await Connection.open();
        let doc = await Connection.timetable.findOne({configId: "weekly_default"});
        if (!doc) {
            const defaultTable = new TimeTable();
            await Connection.timetable.insertOne(defaultTable.toJSON());
            return defaultTable;
        }
        return new TimeTable(doc.schedule);
    }

    async save() {
        await Connection.open();
        await Connection.timetable.updateOne(
            {configId: "weekly_default"},
            {$set: {schedule: this.schedule}},
            {upsert: true}
        );
    }
}