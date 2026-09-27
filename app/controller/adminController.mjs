import {DAYS_OF_WEEK, SERVICE_HOURS} from "../model/modelTimeTable.mjs";
import {getTimeTable, updateTimeTable} from "../model/handlerTimeTable.mjs";
import {getAllAppointments} from "../model/handlerAppointment.mjs";

/**
 * Builds the weekly schedule rows for the Handlebars template
 */
function buildScheduleRows(schedule) {
    return SERVICE_HOURS.map((hour) => ({
        hour,
        cells: DAYS_OF_WEEK.map((dayObj) => ({
            dayKey: dayObj.key,
            dayLabel: dayObj.label,
            hour,
            capacity: schedule?.[dayObj.key]?.[hour] ?? 0
        }))
    }));
}

/**
 * GET /listaPetAgenda
 * Renders the list of booked appointments for the Pet Shop administration
 */
export async function renderAppointmentList(req, res) {
    try {
        const appointments = await getAllAppointments();

        if (req.headers.accept?.includes("application/json") && req.query.format === "json") {
            return res.status(200).json({appointments});
        }

        res.render("appointmentList", {
            pageTitle: "Agenda de Atendimentos",
            appointments,
            hasAppointments: appointments.length > 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar a lista de agendamentos.");
    }
}

/**
 * GET /ajustaPetAgenda
 */
export async function renderScheduleConfig(req, res) {
    try {
        const schedule = await getTimeTable();
        res.render("scheduleConfig", {
            pageTitle: "Configurar Horários de Atendimento",
            days: DAYS_OF_WEEK,
            rows: buildScheduleRows(schedule),
            successMessage: req.query.saved === "1"
                ? "Configuração da agenda salva com sucesso!"
                : null,
            errorMessage: req.query.error === "1"
                ? "Erro ao salvar a configuração da agenda."
                : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar a configuração de horários.");
    }
}

/**
 * POST /ajustaPetAgenda
 */
export async function handleScheduleConfigUpdate(req, res) {
    try {
        const newSchedule = {};

        if (req.body && typeof req.body.schedule === "object") {
            Object.assign(newSchedule, req.body.schedule);
        } else {
            for (const dayObj of DAYS_OF_WEEK) {
                const dayKey = dayObj.key;
                newSchedule[dayKey] = {};
                for (const hour of SERVICE_HOURS) {
                    const fieldName = `slot_${dayKey}_${hour}`;
                    if (req.body && req.body[fieldName] !== undefined) {
                        newSchedule[dayKey][hour] = Number(req.body[fieldName]);
                    }
                }
            }
        }

        const updated = await updateTimeTable(newSchedule);

        if (req.is("application/json") || req.headers.accept?.includes("application/json")) {
            return res.status(200).json({
                success: true,
                message: "Configuração da agenda salva com sucesso!",
                schedule: updated
            });
        }

        return res.redirect("/ajustaPetAgenda?saved=1");
    } catch (err) {
        console.error(err);
        return res.redirect("/ajustaPetAgenda?error=1");
    }
}