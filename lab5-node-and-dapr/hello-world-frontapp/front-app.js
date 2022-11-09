import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr';
import * as http from 'http';
import * as url from 'url';

const daprHost = "127.0.0.1";
const daprPort = process.env.DAPR_HTTP_PORT || "3500";
const daprclient = new DaprClient(daprHost, daprPort);

const serviceStoreName = "statestore";
const serviceAppId = "nodeapp";

let app_instance_id = 0
const PORT = process.env.APP_PORT || "3100"

// create an HTTP server that handles HTTP requests; it is handed two parameters: the request and response objects
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.method === 'GET' && req.url !== '/dapr/config') { // note: the first GET request sent to the application is from the sidecar at path /dapr/config; we do not currently have a proper implementation for that path
            const query = url.parse(req.url, true).query
            let key = query.name ? query.name : "World"
            //Use Dapr Sidecar to invoke a remote method (the HelloWorld service)
            const result = await daprclient.invoker.invoke(serviceAppId, "/?" + key, HttpMethod.GET);
            res.end(result)
        }
        res.end()
    }
})
server.listen(PORT);
determineAppInstanceId();
console.log(`HTTP Server is listening at port ${PORT} for HTTP GET requests`)

async function determineAppInstanceId() {
    app_instance_id = await retrieveIncrementSave("instance-sequence-number");
    console.log(`HelloWorld-FrontEnd application with instance id ${app_instance_id} reports for duty`)
}

async function retrieveIncrementSave(key) {
    let value = 0;
    let response = await daprclient.state.get(serviceStoreName, key);
    if (!response) {
        value = 1;
    } else {
        value = parseInt(response) + 1;
    }
    let saveStateResponse = await daprclient.state.save(serviceStoreName, [
        {
            key: key,
            value: `${value}`
        }
    ]);
    return value;
}