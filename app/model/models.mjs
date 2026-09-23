// @ts-check

export class Client {
    /**
     * @param {String}Name
     * @param {Number}cpf
     */
    constructor(Name,cpf) {
        if(Name === ""){
            throw "No Name provided"
        }
        this.name = Name;
        this.cpf = cpf;
    }
    toJSON(){
        return {
            name: this.name,
            cpf: this.cpf,
        }
    }

}
// An appointment is a client and a date
export class Appointment {
    /**
     * @param {Number}appointmentTime
     * @param {Client}client*/

    constructor(appointmentTime,client) {
        this.time = appointmentTime;
        this.client = client;
    }
    toJSON(){
        return {
            dateMs:this.time,
            clientCPF:this.client.cpf
        }
    }
}