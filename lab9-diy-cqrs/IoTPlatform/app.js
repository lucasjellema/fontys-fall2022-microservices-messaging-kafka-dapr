import { DaprClient,DaprServer } from '@dapr/dapr';
import * as http from 'http';
import * as url from 'url';
const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3501";
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = process.env.APP_PORT || 5002;


const PUBSUB_NAME = "iot-platform-pubsub";
const TOPIC_NAME  = "connection-mandates-topic"
const STATESTORE_NAME = "statestore";


const PORT = process.env.APP_REST_PORT ||5010;

const daprclient = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT);
async function main() {
  const server = new DaprServer(SERVER_HOST, SERVER_PORT, DAPR_HOST, DAPR_HTTP_PORT);

  // Dapr subscription routes orders topic to this route
  server.pubsub.subscribe(PUBSUB_NAME, TOPIC_NAME, async (data) =>  {
    console.log("Subscriber received: " + data)
    let connectionMandate = JSON.parse(data)
    // save connectionMandate to the statestore
    const response = await daprclient.state.save(STATESTORE_NAME, [
        {
            key: connectionMandate.connectionId,
            value: connectionMandate
        }
    ]);
  }
    );

  await server.start();
}

main().catch(e => console.error(e));

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        // get all query parameters from the URL
        const query = url.parse(req.url, true).query
        if (query.connectionId) {
            console.log(`Request received for connection identifier ${query.connectionId}`)
            const connectionMandate = await daprclient.state.get(STATESTORE_NAME, query.connectionId );   
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
