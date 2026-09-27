import {Client, Appointment, TimeTable, DAYS_OF_WEEK, SERVICE_HOURS} from "./models.mjs";
import {Connection} from "./connector.mjs";

const JS_DAY_TO_KEY = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
};

/**
 * @param {Client} client
 */
export async function addClientIfNotExists(client) {
    await Connection.open();
    let testClient = await getClientByCPF(client.cpf);

    if (testClient != null) {
        console.log("did not insert, client already exists");
        return testClient;
    }

    try {
        await Connection.clients.insertOne(client.toJSON());
        console.log("inserted client");
    } catch (err) {
        console.log(err);
    }
    return client;
}

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
 * @param {String|Number} cpf
 */
export async function getClientByCPF(cpf) {
    await Connection.open();
    const normalizedCpf = String(cpf).trim();
    let clientData = await Connection.clients.findOne({cpf: normalizedCpf});
    if (clientData != null) {
        return new Client(clientData.name, clientData["cpf"], clientData._id);
    } else {
        return null;
    }
}

/**
 * Returns the weekly schedule capacity configuration
 */
export async function getTimeTable() {
    const table = await TimeTable.get();
    return table.schedule;
}

/**
 * Updates the configured capacity for each day and hour
 * @param {Object.<string, Object.<string, number>>} newSchedule
 */
export async function updateTimeTable(newSchedule) {
    const current = await TimeTable.get();
    for (const dayObj of DAYS_OF_WEEK) {
        const dayKey = dayObj.key;
        if (!current.schedule[dayKey]) current.schedule[dayKey] = {};
        for (const hour of SERVICE_HOURS) {
            if (newSchedule?.[dayKey]?.[hour] !== undefined) {
                const parsed = parseInt(String(newSchedule[dayKey][hour]), 10);
                current.schedule[dayKey][hour] = (!isNaN(parsed) && parsed >= 0) ? parsed : 0;
            }
        }
    }
    await current.save();
    return current.schedule;
}

/**
 * Converts a timestamp (dateMs) into weekday key, label, and formatted date/time strings
 * @param {Number} dateMs
 */
export function parseSlotFromDateMs(dateMs) {
    const d = new Date(Number(dateMs));
    const dayKey = JS_DAY_TO_KEY[d.getDay()] || null;
    const dayObj = DAYS_OF_WEEK.find((item) => item.key === dayKey);
    const dayLabel = dayObj ? dayObj.label : null;
    const hourStr = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    const dateStr = String(d.getDate()).padStart(2, "0") + "/" +
                    String(d.getMonth() + 1).padStart(2, "0") + "/" +
                    d.getFullYear();
    return {dayKey, dayLabel, hourStr, dateStr, dateObj: d};
}

/**
 * Checks available capacity for a specific slot timestamp (dateMs)
 * @param {Number} dateMs
 */
export async function getSlotAvailableCapacity(dateMs) {
    await Connection.open();
    const {dayKey, hourStr} = parseSlotFromDateMs(dateMs);
    if (!dayKey || !SERVICE_HOURS.includes(hourStr)) {
        return 0;
    }

    const schedule = await getTimeTable();
    const configuredCapacity = Number(schedule?.[dayKey]?.[hourStr] ?? 0);
    if (configuredCapacity <= 0) {
        return 0;
    }

    const bookedCount = await Connection.appointments.countDocuments({dateMs: Number(dateMs)});
    return Math.max(0, configuredCapacity - bookedCount);
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