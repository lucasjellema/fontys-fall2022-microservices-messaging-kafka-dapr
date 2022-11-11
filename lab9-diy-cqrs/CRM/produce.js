import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr';

const daprHost = "127.0.0.1"; 
const daprPort = process.env.DAPR_HTTP_PORT ;

const PUBSUB_NAME = "pubsub"
const TOPIC_NAME  = "connection-mandates-topic"
const daprclient = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP)

export const produceMessage = async function (message) {

    // publish message to topic TOPIC_NAME 
    await daprclient.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, message); // publish the name to the pubsub topic
    console.log(`Published message ${message} to topic ${TOPIC_NAME}`)
}


