import {Client,Appointment} from "./models.mjs";
import {Connection} from "./connector.mjs";
/**
 * @param {Client}client*/
export async function addClientIfNotExists(client){
    try {
        await Connection.clients.insertOne(client.toJSON());
    }catch(err) {
        console.log(err);
    }
    console.log("inserted client");
}

/**
 * @param {Appointment}appointment*/
export async function addAppointment(appointment){
    try {
        await Connection.appointments.insertOne(appointment.toJSON());
    }catch(err){
        console.log(err);
    }
    console.log("inserted appointment")
}

//async function inserte(nome, cpf, idade) {
//   try {
//     let a = await alunos.insertOne({
//       nome:nome,
//       idade: idade,
//       sexo: "f",
//       CPF: cpf,
//       profissao: "programador c++",
//     });
//   } catch (e) {
//     console.log("Falha ao inserir registro");
//   }
// }

/**
 * @param {Number}cpf
 */
export function getClientByCPF(cpf){

}