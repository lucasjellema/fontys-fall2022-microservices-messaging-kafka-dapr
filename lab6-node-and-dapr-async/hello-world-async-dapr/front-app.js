import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr';
import * as http from 'http';
import * as url from 'url';

const PORT = process.env.APP_PORT || "3200"
const daprHost = "127.0.0.1"; 
const daprPort = process.env.DAPR_HTTP_PORT ;

const PUBSUB_NAME = "pubsub"
const TOPIC_NAME  = "names"
const daprclient = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP)

const serviceStoreName = "statestore";

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url !== '/dapr/config') { // note: the first GET request sent to the application is from the sidecar at path /dapr/config; we do not currently have a proper implementation for that path
        const query = url.parse(req.url, true).query
        let key = query.name ? query.name : "World"
        let text
 
        if (key != null) {
            try {
                let value = 0;
                let response = await daprclient.state.get(serviceStoreName, key ); // try to find entry in statestore with this key
                if (!response) {
                    value = 1; // if it was not found, the name is now mentioned for the first time
                } else {
                    value = parseInt(response) + 1; // if it was found, the response indicates how many times before now the name was mentioned
                }
                text = `Hello ${key} - greeting #${value}`

                // inform topic TOPIC_NAME on pubsub PUBSUB_NAME of the name that was requested
                await daprclient.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, key); // publish the name to the pubsub topic
                console.log(`Published name ${key} to topic ${TOPIC_NAME}`)

            } catch (e) { text = `Exception occurred ${e}` }
        }

        res.setHeader('Content-Type', 'text/html');
        res.end(text)
    }
    res.end()
})

server.listen(PORT);
console.log(`HTTP Server is listening at port ${PORT} for HTTP GET requests`)

