
import {TimeTable} from "../model/modelTimeTable.mjs";

/**
 * GET /
 * Renders the client homepage with the weekly calendar of available time slots
 */
export async function renderClientHome(req, res) {
    try {
        const calendar = await TimeTable.getWeeklyCalendarData();

        res.render("home", {
            pageTitle: "Agendamento de Banho e Tosa",
            weekDays: calendar.weekDays,
            rows: calendar.rows,
            availableOptions: calendar.availableOptions,
            hasAvailableSlots: calendar.hasAvailableSlots,
            successMessage: req.query.success || null,
            errorMessage: req.query.error || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar os horários disponíveis.");
    }
}