
import {Appointment} from "../model/modelAppointment.mjs";

/**
 * POST /
 * Validates availability and books an appointment for the client
 */
export async function handleClientBooking(req, res) {
    try {
        const name = req.body?.name ? String(req.body.name).trim() : "";
        const cpf = req.body?.cpf ? String(req.body.cpf).trim() : "";
        const dateMs = Number(req.body?.dateMs);

        if (!name || !cpf || isNaN(dateMs)) {
            const msg = "Por favor, selecione um horário válido e preencha Nome e CPF.";
            if (req.is("application/json") || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({success: false, message: msg});
            }
            return res.redirect("/?error=" + encodeURIComponent(msg));
        }

        const result = await Appointment.bookAppointment(name, cpf, dateMs);

        // If client used fetch expecting JSON (PDF Section 5)
        if (req.is("application/json") || req.headers.accept?.includes("application/json")) {
            return res.status(result.success ? 201 : 409).json(result);
        }

        // Standard <form> submission using Post/Redirect/Get pattern
        if (result.success) {
            return res.redirect("/?success=" + encodeURIComponent(result.message));
        } else {
            return res.redirect("/?error=" + encodeURIComponent(result.message));
        }
    } catch (err) {
        console.error(err);
        const msg = "Erro interno ao processar o agendamento.";
        if (req.is("application/json") || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({success: false, message: msg});
        }
        return res.redirect("/?error=" + encodeURIComponent(msg));
    }
}