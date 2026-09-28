// @ts-check
import {Client} from "./modelClient.mjs";
import {Connection} from "./connector.mjs";
import {TimeTable} from "./modelTimeTable.mjs";

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

    /**
     *
     */
    async save() {
        try {
            await Connection.appointments.insertOne(this.toJSON());
            console.log("inserted appointment");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Books an appointment following all 5 steps from PDF Section 2
     * @param {String} name
     * @param {String|Number} cpf
     * @param {Number} dateMs
     */
    static async bookAppointment(name, cpf, dateMs) {
        const timestamp = Number(dateMs);

        if (isNaN(timestamp) || timestamp <= Date.now()) {
            return {success: false, message: "Não é possível agendar em um horário que já passou."};
        }

        const available = await TimeTable.getSlotAvailableCapacity(timestamp);
        if (available <= 0) {
            return {success: false, message: "Este horário não possui mais vagas disponíveis."};
        }

        const client = await Client.get(name, cpf);
        await client.save();

        const _appointment = new Appointment(timestamp, client);
        await _appointment.save();

        const remainingCapacity = await TimeTable.getSlotAvailableCapacity(timestamp);
        return {
            success: true,
            message: "Agendamento realizado com sucesso!",
            remainingCapacity
        };
    }

    /**
     * Lists all appointments formatted for the admin schedule page
     */
    static async  getAllAppointments() {
        const rawAppointments = await Connection.appointments.find({}).sort({dateMs: 1}).toArray();
        const result = [];

        for (const appt of rawAppointments) {
            const client = await Client.getClientByCPF(appt.clientCPF);
            const {dateStr, hourStr} = TimeTable.parseSlotFromDateMs(appt.dateMs);
            result.push({
                dateMs: appt.dateMs,
                date: dateStr,
                hour: hourStr,
                clientName: client ? client.name : "Cliente não encontrado",
                clientCPF: appt.clientCPF
            });
        }

        return result;
    }
}