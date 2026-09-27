import {Client} from "./modelClient.mjs";
import {Connection} from "./connector.mjs";

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