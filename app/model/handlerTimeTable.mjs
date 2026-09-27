import {TimeTable, DAYS_OF_WEEK, SERVICE_HOURS} from "./modelTimeTable.mjs";
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
 * Computes the Monday date of the active scheduling week.
 * If today is Sunday (0) or Saturday after 17:00, it targets the upcoming week.
 */
function getTargetWeekMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);

    if (dayOfWeek === 0) {
        monday.setDate(now.getDate() + 1);
    } else if (dayOfWeek === 6 && now.getHours() >= 17) {
        monday.setDate(now.getDate() + 2);
    } else {
        monday.setDate(now.getDate() - (dayOfWeek - 1));
    }

    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Builds the weekly calendar structure with available slots for the client view
 */
export async function getWeeklyCalendarData() {
    await Connection.open();
    const schedule = await getTimeTable();
    const monday = getTargetWeekMonday();
    const nowMs = Date.now();

    const weekDays = DAYS_OF_WEEK.map((dayObj, index) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + index);
        const shortDate = String(d.getDate()).padStart(2, "0") + "/" +
                          String(d.getMonth() + 1).padStart(2, "0");
        const fullDate = shortDate + "/" + d.getFullYear();
        return {
            key: dayObj.key,
            label: dayObj.label,
            shortDate,
            fullDate,
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate()
        };
    });

    const weekStartMs = monday.getTime();
    const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;
    const weekAppointments = await Connection.appointments
        .find({dateMs: {$gte: weekStartMs,$lt: weekEndMs}})
        .toArray();

    const bookedCountByMs = {};
    for (const appt of weekAppointments) {
        bookedCountByMs[appt.dateMs] = (bookedCountByMs[appt.dateMs] || 0) + 1;
    }

    const availableOptions = [];

    const rows = SERVICE_HOURS.map((hour) => {
        const [h, m] = hour.split(":").map(Number);

        const cells = weekDays.map((dayInfo) => {
            const slotDate = new Date(dayInfo.year, dayInfo.month, dayInfo.date, h, m, 0, 0);
            const dateMs = slotDate.getTime();
            const configured = Number(schedule?.[dayInfo.key]?.[hour] ?? 0);
            const booked = bookedCountByMs[dateMs] || 0;
            const remaining = Math.max(0, configured - booked);
            const isPast = dateMs <= nowMs;
            const isAvailable = !isPast && remaining > 0;

            if (isAvailable) {
                availableOptions.push({
                    dateMs,
                    label: `${dayInfo.label} (${dayInfo.fullDate}) às ${hour} — ${remaining} vaga(s)`
                });
            }

            return {
                dateMs,
                dayLabel: dayInfo.label,
                fullDate: dayInfo.fullDate,
                hour,
                remaining,
                isPast,
                isAvailable
            };
        });

        return {hour, cells};
    });

    return {
        weekDays,
        rows,
        availableOptions,
        hasAvailableSlots: availableOptions.length > 0
    };
}