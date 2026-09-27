import {Client, Appointment, TimeTable, DAYS_OF_WEEK, SERVICE_HOURS} from "./models.mjs";
import {Connection} from "./connector.mjs";

const JS_DAY_TO_NAME = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado"
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
 * Retorna a tabela de configuração semanal de horários
 */
export async function getTimeTable() {
    const table = await TimeTable.get();
    return table.schedule;
}

/**
 * Atualiza a capacidade configurada para cada dia e horário (/ajustaPetAgenda)
 * @param {Object.<string, Object.<string, number>>} newSchedule
 */
export async function updateTimeTable(newSchedule) {
    const current = await TimeTable.get();
    for (const day of DAYS_OF_WEEK) {
        if (!current.schedule[day]) current.schedule[day] = {};
        for (const hour of SERVICE_HOURS) {
            if (newSchedule?.[day]?.[hour] !== undefined) {
                const parsed = parseInt(String(newSchedule[day][hour]), 10);
                current.schedule[day][hour] = (!isNaN(parsed) && parsed >= 0) ? parsed : 0;
            }
        }
    }
    await current.save();
    return current.schedule;
}

/**
 * Converte um timestamp (dateMs) no nome do dia da semana e string de horário ("HH:00")
 * @param {Number} dateMs
 */
export function parseSlotFromDateMs(dateMs) {
    const d = new Date(Number(dateMs));
    const dayName = JS_DAY_TO_NAME[d.getDay()] || null;
    const hourStr = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    const dateStr = String(d.getDate()).padStart(2, "0") + "/" +
                    String(d.getMonth() + 1).padStart(2, "0") + "/" +
                    d.getFullYear();
    return {dayName, hourStr, dateStr, dateObj: d};
}

/**
 * Verifica a capacidade disponível de um horário específico (dateMs)
 * @param {Number} dateMs
 */
export async function getSlotAvailableCapacity(dateMs) {
    await Connection.open();
    const {dayName, hourStr} = parseSlotFromDateMs(dateMs);
    if (!dayName || !SERVICE_HOURS.includes(hourStr)) {
        return 0;
    }

    const schedule = await getTimeTable();
    const configuredCapacity = Number(schedule?.[dayName]?.[hourStr] ?? 0);
    if (configuredCapacity <= 0) {
        return 0;
    }

    const bookedCount = await Connection.appointments.countDocuments({dateMs: Number(dateMs)});
    return Math.max(0, configuredCapacity - bookedCount);
}

/**
 * Realiza um agendamento seguindo os 5 passos da Seção 2 do PDF:
 * 1. Verifica disponibilidade novamente no momento da confirmação (e se não está no passado)
 * 2. Cadastra ou identifica o cliente
 * 3. Registra o agendamento associado ao cliente
 * 4. Atualiza (reduz) a capacidade disponível do horário
 * 5. Retorna resultado para informar ao cliente
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
 * Lista todos os agendamentos com Data, Horário, Nome do Cliente e CPF (/listaPetAgenda)
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