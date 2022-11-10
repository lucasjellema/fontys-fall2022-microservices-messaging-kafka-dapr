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



## Special Use case: Dapr as Interaction Broker

Just by configuring a binding component for Kafka and running a Dapr sidecar (even with no real application connected to it) do we get an HTTP and gRPC endpoint that can be used to interact with Apache Kafka (or any other component that Dapr supports with an output binding component). The ability to expose complex interactions (communication protocol, connection management, message format) through simple HTTP interaction may be useful for example for automated test scenarios or data engineering activities)

![](images/http-dapr-outputbindings.png)  

If you want to use curl to interact with MongoDB, Azure Blob Storage, Twitter, GCP Pub/Sub, Apple Push Notifications then that can easily be arranged. Configure the destination as a Dapr output binding component, run the Dapr sidecar and interact over local http from curl to the sidecar in order to have the sidecar do the actual interaction with the special component you want to target,

## Resources

[Dapr Docs - Kafka Binding Spec](https://docs.dapr.io/reference/components-reference/supported-bindings/kafka/)
[Dapr Docs - How to Input Bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-triggers/)
[Dapr Docs - How To Output Bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-bindings/)