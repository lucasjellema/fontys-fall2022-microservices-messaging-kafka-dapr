import { DaprClient, DaprServer, LogLevel, CommunicationProtocolEnum } from '@dapr/dapr';
import * as http from 'http';
import * as url from 'url';

const PUBSUB_NAME = "iot-platform-pubsub";
const TOPIC_NAME  = "names"

const daprHost = "127.0.0.1"; 
const daprPort = process.env.DAPR_HTTP_PORT ;

const serverHost = "127.0.0.1";
const serverPort = process.env.APP_PORT ; 

const PORT = process.env.APP_PORT || "3006"

const connectionMandates = {}

async function start() {
    const daprserver = new DaprServer(
        serverHost, 
        4700, 
        daprHost, 
        daprPort, 
        CommunicationProtocolEnum.HTTP, { logger: { level: LogLevel.Verbose }}
    );
    //Subscribe to a topic
    console.log(`subscribing to topic ${TOPIC_NAME} via Dapr`)
    await daprserver.pubsub.subscribe(PUBSUB_NAME, TOPIC_NAME, async (message) => { // function to be invoked whenever a message is received from the sidecar
        console.log(`Subscriber received: ${message} from topic`)
    });
    await daprserver.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

const handleConnectionMandateMessage = function(message) {
    console.log(`Handling ConnectionMandate Message ${message.value.toString()} ` )
    let connectionMandate = JSON.parse(message.value.toString())
    connectionMandates[connectionMandate.connectionId]=connectionMandate
}

// create an HTTP server that handles HTTP requests; it is handed two parameters: the request and response objects
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // get all query parameters from the URL
        const query = url.parse(req.url, true).query
        if (query.connectionId) {
            console.log(`Request received for connection identifier ${query.connectionId}`)
            const connectionMandate = connectionMandates[query.connectionId]
            // return the HTTP response; use the value of the name parameter if it was provided, or use World if it was not
            res.setHeader('Content-Type', 'application/json')
            if (connectionMandate) {
                res.statusCode = 200
                res.end(JSON.stringify(connectionMandate))
            }
            else {
                res.statusCode = 404
                res.statusMessage = "No mandate setting is known for this connection identifier in the IoT Platform service"
                res.end()
            }
        } else {
            res.statusCode = 400
            res.statusMessage = "No query parameter connectionId was found in the request. It is required."
            res.end()
        }
    }
})
server.listen(PORT);
// consumer.setMessageHandler(handleConnectionMandateMessage)
// consumer.initializeConsumer();

console.log(`HTTP Server is listening at port ${PORT} for HTTP GET requests`)

