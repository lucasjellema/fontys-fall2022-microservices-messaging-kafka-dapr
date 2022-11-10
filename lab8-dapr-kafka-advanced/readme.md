# Dapr and Kafka - More Advanced Topics

Kafka is supported in Dapr in two ways. One is as pubsub component to provide the implementation for the microservice to microservice pub/siub interaction pattern. That is what we have been using in the previous sections. However, when we want more control over the interaction with Apache Kafka - for example regarding partitions and consumer groups or security or observability - there is the second option: use Dapr bindings to interact with Kafka. Dapr Bindings come in two flavors: input bindings (that can trigger an application through the Dapr sidecar) and output bindings (where the application takes the initiative to start the interaction). Dapr ships with Kafka Bindings in both directions.

Input Binding:
![](images/kafka-dapr-inputbinding.png)  

Output Binding:
![](images/dapr-kafka-outputbinding.png)  

We will reimplement the Node applications interacting with Kafka from lab 6 - this time using the Kafka Bindings in Dapr to allow for more control and specialized configuration. The impact on the code in the applications is not huge - but there are some effects. 

Next, we implement a more interesting asynchronous use case. And we will also briefly look at a special use case where we run a Dapr Sidecar on its own, just to get access to an assistant that any application or tool that speaks either HTTP or gRPC can use for outbound operations. 

## Asynchronous Name Processing with Node and Dapr - This Time Through Bindings

In lab6 we implemented the following:

![](images/lab6-overview.png)  

And now we will implement the same interactions and functionality, however instead of using Dapr PubSub to take care of the asynchronous interactions we use Dapr Bindings. This changes the diagram a little - but not too much:

![](images/frontapp-kafka-daprbindings-app.png)  

The changes that have to made are in four files: 
* dapr-components/input.yaml
* dapr-components/output.yaml
* app.js
* front-app.js

In the first two files, the input and output bindings are configured. They are of type *bindings.kafka* and they both are configured for the same local Kafka Cluster. The input.yaml specifies the topics(s) to consume messages from and also the name of the consumer group to consume messages as. This allows us to run multiple consuming applications sharing the workload (provided the Kafka Topic is appropriately partitioned). The output.yaml file specifies the topic name to publish to. 

In front-app.js there are some small changes. No more pubsub and no more topic name. Instead a slightly more cryptic `client.binding.send` call with the name of the output binding (that indirectly refers to a Kafka Topic to publish to) and the name of the operation to execute: `create` which is fairly generic. The code in front-app.js at this point does not show that what it does is publish a message on a Kafka Topic. 

Similarly in app.js there is no reference to a topic or to the pubsub interaction. In its place, there is again a fairly generic `await server.binding.receive(NAMES_INPUT_BINDING_NAME, ..` call that is linked through the name of the input binding to the Kafka Input Binding as defined in input.yaml and thereby to the topic to consume message from and the consumer group to participate in. The code is free from dependencies on Kafka and even from consuming messages from a message broker. The exact same command would be used to be triggered by Cron, MQTT, Twitter or Zeebe job worker. 

To run the applications, we use the same instructions as before. Open two terminal windows for directory *lab8-dapr-kafka-advanced\hello-world-async-dapr*. In the first, run the consuming application: 

```
alias dapr="/workspace/dapr/dapr"
export APP_PORT=6031
export SERVER_PORT=6032
export DAPR_HTTP_PORT=3631
dapr run --app-id name-processor --app-port $APP_PORT --dapr-http-port $DAPR_HTTP_PORT --components-path dapr-components node app.js 
```

In the second terminal, run the *front-app* that will produce the messages to Kafka: 

```
alias dapr="/workspace/dapr/dapr"
export APP_PORT=6030
export DAPR_HTTP_PORT=3630
dapr run --app-id greeter --app-port $APP_PORT --dapr-http-port $DAPR_HTTP_PORT --components-path dapr-components  node front-app.js 
```

In a third terminal window, make a number of calls that will be handled by the front-app:
```
curl localhost:6030?name=Michael
curl localhost:6030?name=Michael
curl localhost:6030?name=William
curl localhost:6030?name=William
curl localhost:6030?name=William
curl localhost:6030?name=Kate
```

You will not see much spectacle. These calls should give you proper responses. And the logging for the two applications should indicate the processing of the HTTP request from curl and handling an input trigger respectively.

## Special Use case: Dapr as Interaction Broker

Just by configuring a binding component for Kafka and running a Dapr sidecar (even with no real application connected to it) do we get an HTTP and gRPC endpoint that can be used to interact with Apache Kafka (or any other component that Dapr supports with an output binding component). The ability to expose complex interactions (communication protocol, connection management, message format) through simple HTTP interaction may be useful for example for automated test scenarios or data engineering activities)

![](images/http-dapr-outputbindings.png)  

If you want to use curl to interact with MongoDB, Azure Blob Storage, Twitter, GCP Pub/Sub, Apple Push Notifications then that can easily be arranged. Configure the destination as a Dapr output binding component, run the Dapr sidecar and interact over local http from curl to the sidecar in order to have the sidecar do the actual interaction with the special component you want to target,

## Resources

[Dapr Docs - Kafka Binding Spec](https://docs.dapr.io/reference/components-reference/supported-bindings/kafka/)
[Dapr Docs - How to Input Bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-triggers/)
[Dapr Docs - How To Output Bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-bindings/)