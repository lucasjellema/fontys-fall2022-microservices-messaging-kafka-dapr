import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr';

const daprHost = "127.0.0.1"; 
const daprPort = process.env.DAPR_HTTP_PORT ;

const PUBSUB_NAME = "pubsub"
const TOPIC_NAME  = "orders"
const daprclient = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP)
const oneSecondInMs = 1000
const publishingDelayInSeconds = 5

var main = async function() {
    for(var i=0;i<10;i++) {
        await sleep(publishingDelayInSeconds * oneSecondInMs);
        var orderId = Math.floor(Math.random() * (oneSecondInMs - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    console.log("Published data:" + orderId)
    await daprclient.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
