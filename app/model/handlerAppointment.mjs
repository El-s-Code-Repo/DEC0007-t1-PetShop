import {Client} from "./modelClient.mjs";
import {Appointment} from "./modelAppointment.mjs";
import {Connection} from "./connector.mjs";
import {getClientByCPF} from "./handlerClient.mjs";
import {getSlotAvailableCapacity, parseSlotFromDateMs} from "./handlerTimeTable.mjs";

/**
 * @param {Appointment} appointment
 */
export async function addAppointment(appointment) {
    await Connection.open();
    try {
        await Connection.appointments.insertOne(appointment.toJSON());
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
export async function bookAppointment(name, cpf, dateMs) {
    await Connection.open();
    const timestamp = Number(dateMs);

    if (isNaN(timestamp) || timestamp <= Date.now()) {
        return {success: false, message: "Não é possível agendar em um horário que já passou."};
    }

    const available = await getSlotAvailableCapacity(timestamp);
    if (available <= 0) {
        return {success: false, message: "Este horário não possui mais vagas disponíveis."};
    }

    const client = await Client.get(name, cpf);
    await client.save();

    const appointment = new Appointment(timestamp, client);
    await addAppointment(appointment);

    const remainingCapacity = await getSlotAvailableCapacity(timestamp);
    return {
        success: true,
        message: "Agendamento realizado com sucesso!",
        remainingCapacity
    };
}

/**
 * Lists all appointments formatted for the admin schedule page
 */
export async function getAllAppointments() {
    await Connection.open();
    const rawAppointments = await Connection.appointments.find({}).sort({dateMs: 1}).toArray();
    const result = [];

    for (const appt of rawAppointments) {
        const client = await getClientByCPF(appt.clientCPF);
        const {dateStr, hourStr} = parseSlotFromDateMs(appt.dateMs);
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