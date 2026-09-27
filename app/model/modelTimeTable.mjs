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
        await Connection.open();
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

    async save() {
        await Connection.open();
        await Connection.timetable.updateOne(
            {configId: "weekly_default"},
            {$set: {schedule: this.schedule}},
            {upsert: true}
        );
    }
}