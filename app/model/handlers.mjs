import {Client,Appointment} from "./models.mjs";
import {Connection} from "./connector.mjs";

/**
 * @param {Client}client*/
export async function addClientIfNotExists(client){
    let testClient = await getClientByCPF(client.cpf);

    if(testClient !=null){
        console.log("did not inset, client already exists")
        return;
    }

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
export async function getClientByCPF(cpf) {
    let clientData = await Connection.clients.findOne({cpf: cpf});
    if (clientData != null) {
        return new Client(clientData.name, clientData["cpf"]);

    } else return null;
}

//async function consulta() {
//   let a = await alunos.findOne({ idade: 32 });
//
//   console.log(a);
// }