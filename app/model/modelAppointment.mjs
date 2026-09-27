// @ts-check
import {Client} from "./modelClient.mjs";

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