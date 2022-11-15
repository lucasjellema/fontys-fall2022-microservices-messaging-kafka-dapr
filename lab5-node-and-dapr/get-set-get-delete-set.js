import { DaprClient} from '@dapr/dapr'; 
const daprHost = "127.0.0.1";
const daprPort = process.env.DAPR_HTTP_PORT || "3500";
const daprclient = new DaprClient(daprHost, daprPort);

const serviceStoreName = "statestore";
const KEY = "THE_KEY"

// get
let value = await daprclient.state.get(serviceStoreName, KEY );
console.log(`first get - value = ${value}`)
value = "A REAL VALUE"
// set
let response = await daprclient.state.save(serviceStoreName, [
    {
        key: KEY,
        value: `${value}`
    }
]);
console.log(`after set - result from set: = ${response}`)
// get
value = await daprclient.state.get(serviceStoreName, KEY );
console.log(`Second get (after set) - value = ${value}`)
// delete
response = await daprclient.state.delete(serviceStoreName, KEY)
console.log(`after delete - result from set: = ${response}`)
// get
value = await daprclient.state.get(serviceStoreName, KEY );
console.log(`Third get (after delete) - value = ${value}`)



