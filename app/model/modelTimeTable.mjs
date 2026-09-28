// @ts-check
import {Connection} from "./connector.mjs";

export const DAYS_OF_WEEK = [
    {key: "monday", label: "Segunda"},
    {key: "tuesday", label: "Terça"},
    {key: "wednesday", label: "Quarta"},
    {key: "thursday", label: "Quinta"},
    {key: "friday", label: "Sexta"},
    {key: "saturday", label: "Sábado"}
];
const JS_DAY_TO_KEY = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
};

export const SERVICE_HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export class TimeTable {
    /**
     * @param {Object.<string, Object.<string, number>>} [schedule]
     */
    constructor(schedule) {
        this.schedule = schedule || TimeTable.getDefaultSchedule();
    }

    static getDefaultSchedule() {
        return {
            monday:    {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 1, "15:00": 1, "16:00": 1, "17:00": 1},
            tuesday:   {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            wednesday: {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 1, "15:00": 1, "16:00": 1, "17:00": 1},
            thursday:  {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            friday:    {"08:00": 2, "09:00": 2, "10:00": 2, "11:00": 2, "14:00": 2, "15:00": 2, "16:00": 2, "17:00": 2},
            saturday:  {"08:00": 1, "09:00": 1, "10:00": 1, "11:00": 1, "14:00": 0, "15:00": 0, "16:00": 0, "17:00": 0}
        };
    }

    toJSON() {
        return {
            configId: "weekly_default",
            schedule: this.schedule
        };
    }

    static async get() {
        let doc = await Connection.timetable.findOne({configId: "weekly_default"});
        if (!doc || !doc.schedule || !doc.schedule.monday) {
            const defaultTable = new TimeTable();
            await Connection.timetable.updateOne(
                {configId: "weekly_default"},
                {$set: {schedule: defaultTable.schedule}},
                {upsert: true}
            );
            return defaultTable;
        }
        return new TimeTable(doc.schedule);
    }

    /**
     * Returns the weekly schedule capacity configuration
     * Refactored from getTimeTable
     */
     static async getSchedule() {
        const table = await TimeTable.get();
        return table.schedule;
    }

    async save() {
        await Connection.timetable.updateOne(
            {configId: "weekly_default"},
            {$set: {schedule: this.schedule}},
            {upsert: true}
        );
    }

    /**
     * Updates the configured capacity for each day and hour
     * @param {Object.<string, Object.<string, number>>} newSchedule
     */
    static async updateTimeTable(newSchedule) {
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
     * Computes the Monday date of the active scheduling week.
     * If today is Sunday (0) or Saturday after 17:00, it targets the upcoming week.
     */
    static getTargetWeekMonday() {
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
     * Checks available capacity for a specific slot timestamp (dateMs)
     * @param {Number} dateMs
     */
    static async getSlotAvailableCapacity(dateMs) {
        const {dayKey, hourStr} = TimeTable.parseSlotFromDateMs(dateMs);
        if (!dayKey || !SERVICE_HOURS.includes(hourStr)) {
            return 0;
        }

        const schedule = await TimeTable.getSchedule();
        const configuredCapacity = Number(schedule?.[dayKey]?.[hourStr] ?? 0);
        if (configuredCapacity <= 0) {
            return 0;
        }

        const bookedCount = await Connection.appointments.countDocuments({dateMs: Number(dateMs)});
        return Math.max(0, configuredCapacity - bookedCount);
    }

    /**
     * Builds the weekly calendar structure with available slots for the client view
     */
    static async getWeeklyCalendarData() {
        const schedule = await TimeTable.getSchedule();
        const monday = TimeTable.getTargetWeekMonday();
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

    /**
     * Converts a timestamp (dateMs) into weekday key, label, and formatted date/time strings
     * @param {Number} dateMs
     */
    static parseSlotFromDateMs(dateMs) {
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
}