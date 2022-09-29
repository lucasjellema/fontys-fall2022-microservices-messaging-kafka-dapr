# Lab - Programmatic interaction with Apache Kafka from Node

- [Lab - Programmatic interaction with Apache Kafka from Node](#lab---programmatic-interaction-with-apache-kafka-from-node)
  - [Node interacting with Apache Kafka](#node-interacting-with-apache-kafka)
    - [Producing to test-topic in Node](#producing-to-test-topic-in-node)
    - [Consuming from test-topic in Node](#consuming-from-test-topic-in-node)
    - [Check in Apache Kafka HQ](#check-in-apache-kafka-hq)
  - [Multi-message producer and Parallel Consumer Teams](#multi-message-producer-and-parallel-consumer-teams)
  - [Bonus: Node Web Application](#bonus-node-web-application)
    - [Node Web Application for Producing Messages](#node-web-application-for-producing-messages)
    - [Node Web Application for Consuming Messages](#node-web-application-for-consuming-messages)

In the pfirstrevious lab, you have produced and consumed messages manually, using Kafkacat and the Apache Kafka HQ GUI. In this lab, you will also produce and consume messages - this time in a programmatic way. You will use the Apache Kafka platform that you used in lab1 as well as the Node run time environment that you worked with in lab2. You will interact with Kafka from Node in the pure form with one of the most popular libraries for using Kafka from Node applications. 

## Node interacting with Apache Kafka

The NPM module repository returns over 660 modules when searched for the keyword *kafka*. Not all of them are libraries to facilitate the interaction from your Node application with Apache Kafka clusters - but over a dozen are. In this lab, we will work with the *node-rdkafka* NPM module, [node-rdkafka on GitHub](https://github.com/Blizzard/node-rdkafka) for details on this particular library and [Reference Docs](https://blizzard.github.io/node-rdkafka/current/) for the API specification. The node-rdkafka library is a high-performance NodeJS client for Apache Kafka that wraps the native (C based) *librdkafka* library. All the complexity of balancing writes across partitions and managing (possibly ever-changing) brokers should be encapsulated in the library.

The sources for this part of the lab are in the directory *node-kafka-client* in the *lab3-node-and-kafka* directory.

### Producing to test-topic in Node

Take a look at the *package.json* file. You will see a dependency configured on *kafkajs*:
```
  "dependencies": {
    "kafkajs": "^2.2.0"
  }
```
Now look at the file *produce.js*. The first line of this Node application also refers to *kafkajs*. When we execute *produce.js*, the Node runtime will try to load the module *kafkajs*. It will try to do so by locating a directory called *kafkajs* under the directory *node-modules* that lives in the root of the application. At this moment, you probably do not yet have this *node-modules* directory. It gets created when you instruct *npm* to download all libraries on which the application depends - as configured in *package.json*.

Kafkajs is an easy to use, modern Node client for Apache Kafka. See: [https://kafka.js.org/](https://kafka.js.org/) for more details on this Kafka client library for Node.

To get going, open a bash terminal window and navigate to directory *lab3-node-and-kafka/node-client*. Then execute `npm install` to download the node modules this application depends on.

```
cd lab3-node-and-kafka/node-client/
npm install
```

This instructs *npm* to download and install in directory *node-modules* all modules that are required directly or indirectly by the application - as defined in the *dependencies* property in *package.json*.

This is as good a time as any to open file *produce.js* again and interpret what it does.

* instantiate the KafkaJS client by pointing it towards the brokers in the Kafka clusters; the IP addresses are configured in the docker-compose.yml file
* create a producer through the KafkaJS client
* connect the producer
* produce the array of messages to a specific topic (in this case the array contains a single message that does not specify a partition, a timestamp or headers) See [Kafkajs Docs on Producing](https://kafka.js.org/docs/producing) for more details
* disconnect the producer

When `npm install` is done installing - which really should not take long with kafkajs -  it is time to produce some messages to the topic.  

Run this command:
```
node producer.js
```

You will see little output. Once done, the application reports it is done and it exits. The message has been delivered to the topic.

When you check either in Kafka Console or in Apache Kafka HQ, you should be able to see a fresh message published to the `test-topic` (or the topic you have specified if you have changed the name of the topic).


### Consuming from test-topic in Node
The obvious next step is the consumption of messages. We will again use a Node application for this. But please realize that there is absolutely no need for consuming using Node: once messages have been produced, we cannot even tell from which type of client they have been produced. So the producing application could have been Java, Python, C, .NET just as well as Node. And the consuming application could be implemented in any technology that has a way to interact with the Kafka Cluster. The choice for Node here is one of convenience.

Check the contents of the file *consumer.js*. It is quite similar to *producer.js*, also using *kafkajs* . 

What goes on in the *consumer.js* application?

* instantiate the KafkaJS client by pointing it towards the brokers in the Kafka clusters; the IP addresses are configured in the docker-compose.yml file
* create a consumer through the KafkaJS client, as a member of consumer group *test-group*
* connect the consumer
* subscribe the consumer to a specific topic, indicating that all messages (`fromBeginning:true`) are requested. When fromBeginning is true, the group will use the earliest offset. If set to false, it will use the latest offset. The default is false.
* define the function that should be invoked for each messages received, using `consumer.run( eachMessage: <function>)` ; in that function, write message details to the console.


Run the Kafka Consumer application:
```
node consumer.js
```
This should print all messages on the *test-topic* to the console. You should see something similar to the following output - with different timestamps obviously - reporting on the consumption of a message that was first produced from *producer.js*:

```
{"level":"INFO","timestamp":"2022-09-29T04:41:39.772Z","logger":"kafkajs","message":"[Consumer] Starting","groupId":"test-group"}
{"level":"INFO","timestamp":"2022-09-29T04:41:39.903Z","logger":"kafkajs","message":"[ConsumerGroup] Consumer has joined the group","groupId":"test-group","memberId":"my-app-fdaed509-2252-4513-8563-377960170ced","leaderId":"my-app-fdaed509-2252-4513-8563-377960170ced","isLeader":true,"memberAssignment":{"test-topic":[0,1]},"groupProtocol":"RoundRobinAssigner","duration":129}
{ value: 'Here I am telling you a story' }
```

You can stop the application with <kbd>Ctrl</kbd> + <kbd>C</kbd>.

If you run the consumer application a second time, you will probably not see any messages - or only new ones. This is the effect of using a Consumer Group Id. The Kafka Cluster retains the Consumer Group Id and its corresponding offset. In the second run, the consuming applications joins the same Consumer Group as before. This group has already consumed all messages. If you now change the Consumer Group Id and run the Node application again, you will see all messages on the topic once more. This is because for this new Consumer Group, no messages at all have been read from the topic, and Kafka will offer up all messages from the beginning of time.

### Check in Apache Kafka HQ
Open the AKHQ browser window. Go to the Topics page and focus on *test-topic*. Verify that the messages published from the Node application show up. Take note of the consumer group registered for this topic: you should see the same label(s) as defined in the *consumer.js* Node application.

Open the Consumer Groups page. You will see the consumer group details. If you run the *consumer.js* application once more, you will see the number of members for the consumer group go up by one. When you drill down into the consumer group and inspect the members, you can see the type of client and the IP address for the member a well as the partition the member is linked to.

On the Topic page, you can produce a message to the *test-topic*. This message will of course be consumed by the *consumer.js* application.


## Multi-message producer and Parallel Consumer Teams

This lab deals with a Node application that runs a number a asynchronous, parallel, background processes. One process produces messages. Three other processes are each message consumers. Two consumers work on the same team (in a Kafka consumer group) and the third consumer is on their own. 

Check out the file `multi-producer-parallel-consumer.js` in directory *lab3-node-and-kafka\node-multi-kafka-producer-consumer*. The code should not be too hard to comprehend. 

Function `produceMessages` is an asynchronous function that runs a loop of the specified number of itereations and in each iteration produces a message to `test-topic`. Before continuing with the next iteration, the process pauses for a number of miliseconds - as specified by the constant *productionInterval*. The function is invoked when this application is executed.

Function `consumeMessages` is obviously a consumer of messages from `test-topic`. Only new messages. The name of a consumer group is passed in the call to the function. The application assigns two consumers to the *blueTeam* and one to the *redTeam*. Processing a message is not complicated: write message details to the console - then sit back and relax and take a break for *consumptionInterval* miliseconds.

The blueTeam with two members can obviously outperform the redTeam with just a single consumer. In this case, because the time it takes to process a message is longer than the (production) interval between messages, a single consumer will not be able to keep up and will start falling behind the message producer. A team with two members should be able to keep up - as long as the processing interval is not longer than twice the production interval.

To run this application, execute these steps:

```
cd /workspace/fontys-fall2022-microservices-messaging-kafka-dapr/lab3-node-and-kafka/node-multi-kafka-producer-consumer
npm install 
node multi-producer-parallel-consumer.js
```

You will see how the messages are produced - about three every two seconds - and how the blueTeam is able to keep up and how the redTeam is falling behind. 

You can stop the application with <kbd>Ctrl</kbd> + <kbd>C</kbd>.

You can start playing around a little: change the (ratio between the) productionratio interval and the consumption interval. Introduce a third team with one or more consumers. Change the number of consumers in the existing teams. Check on AK HQ what you have wrought.  

## Bonus: Node Web Application
With Node, it is fairly easy to publish a web application that allows users to enter messages into a Web User Interface and send them for publication to a Kafka Topic. Or even simpler: to send messages as query parameter in an HTTP GET request, for example by entering a URL in the location bar of your browser or sending a CURL request.

We can also do something similar on the consuming end: publish a web application that makes the messages visible that have been consumed from the Kafka topic. To set the expectations at the right level: the response to an HTTP Request will be a JSON document with all messages received by the consumer. A more fancy UI is left as an exercise to the reader ;-)
 
### Node Web Application for Producing Messages
Earlier in this lab we looked at a very simple Node web application: *hello-world-web*. Now we combine that web application with the Kafka Producer we worked on just before. Look in directory *node-kafka-web-client* and open file *web-producer.js*.

This Node application starts an HTTP Server to handle GET requests. It uses a query parameter called *message* for the content of the message to publish to the Kafka Topic. A module referenced as *./produce* is *required* into the *web-producer.js*. This is interpreted by the Node runtime as: find a local file *produce.js*, load it and make available as public objects anything in *module.exports*. The file *produce.js* is largely the same as before, only this time it does not automatically start generating and publishing messages and it has a function called *produceMessage* that produces one message to the `topic`. This function is exported in *module.exports* and as such available in *web-producer.js*. 

Before you can run the application, you need to bring in the dependencies. To quickly open a terminal window in the right directory, open the content menu for the *web-producer.js* file and choose option *Open in Integrated Terminal*. A terminal window opens and navigates to the correct directory.

In this terminal window, now run:
```
npm install
```
to download all required NPM modules into the directory node-modules.

Now you can run the web application:

```
echo "The external URL for accessing this workspace on port 3001" $(gp url 3001) 
node web-producer.js
```

The HTTP server is started and listens on port 3001. You can send GET requests to this port that have a query parameter called *message*. Whatever value *message* has is used as the content of a message published to the Kafka Topic *test-topic*.

From the command line using tools such as *curl* or *wget* you can make requests that in turn will cause a message to be published to a Kafka topic:

```
wget http://localhost:3001?message=My+Message+is+Hello+World.
```

Alternatively, Gitpod can help you with this by providing the external URL for accessing the Node application on port 3001 through curl from anywhere in the world:

```
curl  $(gp url 3001)?message=A+Beautiful+Message
```

This command opens the Gitpod preview browser and immediately publishes the message:

```
gp preview  $(gp url 3001)?message=A+Message+Produced+Through+The+Internal+Gitpod+Browser
```

Through any browser, open the url displayed after executing the command:

```
echo $(gp url 3001)?message=A+Message+Published+From+Any+Browser+Anywhere+On+The+Internet
```


You can check in Apache Kafka HQ or in the Kafka Console Consumer if the message arrives. Or go to the next section for the consuming web application in Node.


### Node Web Application for Consuming Messages

The consuming web application is very similar in structure to the producer we just discussed. The file *web-consumer.js* starts an HTTP Server that handles HTTP GET Requests. It will return a JSON document with whatever value is returned by the function *consumer.getMessages*. This function is loaded from module *./consume* and exported in *consume.js* in *module.exports*. 

Check the contents of *consume.js*: it should look familiar. New compared to the earlier implementation of *consume.js* is the *messages* array in which all messages consumed from the Kafka Topic are collected - the latest at the top or beginning of the array. The function *getMessages* returns the array. This function is exported in *module.exports*. 

Open another terminal window - most easily by using the option *Open in Integrated Terminal* in the context menu for the file *web-consumer.js*.  Run the web application:

```
node web-consumer.js
```

The HTTP server is started and listens on port 3002. You can send GET requests to this port to get a JSON document with all messages consumed from Kafka Topic *test-topic*. Using this *Gitpod* command you can open the Gitpod browser integrated in the IDE. It will show the messages the consumer has consumed until now. You need to press the refresh icon in order to get any fresher messages.

```
gp preview  $(gp url 3002)
```

You can also check for the messages from outside the context of Gitpod - in any browser (or any command line using curl or wget); the url to use is printed when you execute this command:

```
echo $(gp url 3002)
```

If you keep both web producer and web consumer running at the same time, you can see the effect of one in the other.

