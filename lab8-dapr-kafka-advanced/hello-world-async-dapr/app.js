import { DaprClient, DaprServer, CommunicationProtocolEnum } from '@dapr/dapr';

const daprHost = "127.0.0.1"; 
const daprPort = process.env.DAPR_HTTP_PORT ;
const serverHost = "127.0.0.1";
const serverPort = process.env.APP_PORT ; 

const TOPIC_NAME  = "names"
const NAMES_INPUT_BINDING_NAME = "names-input";

const daprclient = new DaprClient(daprHost, daprPort);
const serviceStoreName = "statestore";

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start() {
    const daprserver = new DaprServer(
        serverHost, 
        serverPort, 
        daprHost, 
        daprPort, 
        CommunicationProtocolEnum.HTTP
    );
    //Subscribe to an input binding to trigger the function
    await daprserver.binding.receive(NAMES_INPUT_BINDING_NAME,  async (message) => { // function to be invoked whenever a message is received from the sidecar
        const name = message.data
        let nameOccurrenceCount = await retrieveIncrementSave(name);
         console.log(`Received message from input binding ${NAMES_INPUT_BINDING_NAME} with name ${name} that has occurred a total of ${nameOccurrenceCount} times`)
    });
    await daprserver.start();
}

async function retrieveIncrementSave(key) {
    let value = 0;
    let response = await daprclient.state.get(serviceStoreName, key );
    if (!response) {
        value = 1;
    } else {
        value = parseInt(response) + 1;
    }
    response = await daprclient.state.save(serviceStoreName, [
        {
            key: key,
            value: `${value}`
        }
    ]);
    return value;
}



