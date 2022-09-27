# Getting started with Apache Kafka

In this lab, you will have your first look and feel around Apache Kafka, using a Gitpod workspace. You can start this workspace using the URL: [https://gitpod.io/#https://github.com/lucasjellema/fontys-fall2022-microservices-messaging-kafka-dapr](https://gitpod.io/#https://github.com/lucasjellema/fontys-fall2022-microservices-messaging-kafka-dapr). Note: you will need a (free) Gitpod account in order to run the workspace. You can easily create such an account using a GitHub or GitLab account. Go to [gitpod.io/workspaces/](https://gitpod.io/workspaces/) and Log In with either GitHub or GitLab account. After doing that, you will be able to run the workspace.

The first thing you will see in terms of the Gitpod workspace is likely the VS Code IDE that launches in the browser. It will show you the source code from the GitHub repository. It probably also shows a terminal window in which docker-compose is running - starting up containers.

Once the workspace is fully launched, there will be several containers running - launched from a `docker-compose.yml` file. One container runs Zookeeper - a shared configuration database. Three containers run Kafka Brokers - the nodes in the cluster. Two final containers run the `kafkacat` utility and the `AK HQ` management console. A browser window is opened as well, showing the web console for `AK HQ` with information about the Kafka cluster. 

The main units of interest in Kafka are topics and messages. A topic is simply the destination to which you publish a message. Topics are contain a stream of messages. Messages are created by producers - and published on a topic. Consumers can register on a Topic and consume messages - at any point in time after they have been published.

In this workshop you will learn how to create topics, how to produce messages, how to consume messages and how to describe/view metadata in Apache Kafka. 

Note: I gratefully made use of Guido Schmutz's https://github.com/gschmutz/stream-processing-workshop/tree/master/02-working-with-kafka-broker when compiling these instructions; Guido is a long time expert on messaging and streaming and he has published many articles, presentations and workshop documents.
    

## Inspect the environment

Click on the plus sign on the right side of the screen to launch a new terminal; select `bash` as the terminal type. 
![](images/open-bash-terminal.png)  

Type

`docker ps`

to list all running containers. The output should look as is shown below: five containers running in the workspace. 

![](images/docker-ps.png)  

### Connect to a Kafka Broker 
The environment contains a Kafka cluster with three brokers, all running on a single, non-distributed Docker host. To work with Kafka in this environment, you can:
* use the AK HQ web console
* use client libraries
* work with command line utilities: either the tools that are available on each broker (such as `kafka-topics`, `kafka-console-producer` and `kafka-console-consumer` ), or the more versatile `kcat` utility that runs in its own container.

The `kafka-topics` utility is used to create, alter, describe, and delete topics. The `kafka-console-producer` and `kafka-console-consumer` can be used to produce/consume messages to/from a Kafka topic. So let's connect into one of the broker through a terminal window. 

In the bash terminal you launched a little bit earlier, use `docker exec` command to start a shell in the `kafka-1` docker container 

```
docker exec -ti kafka-1 bash
```

You will enter the `kafka-1` container. The prompt will change to `[appuser@kafka-1 ~]$`. If you type `hostname` you will be informed of the name of the host - which is the name of the container i.e. `kafka-1`.


### List topics in Kafka

First, let's list the topics available on your Kafka Cluster. For that we use the `kafka-topics` utility with the `--list` option. 

```
kafka-topics --list --zookeeper zookeeper-1:2181
```

We can see that there are no topics yet, apart from an internal (__confluent) topic.  

### Creating a topic in Kafka

Now let's create a new topic. For that we again use the **kafka-topics** utility but this time with the `--create` option. We will create a test topic with 6 partitions and replicated 2 times. The `--if-not-exists` option is handy to avoid errors, in case a topic already exists. 

```
kafka-topics --create --if-not-exists --zookeeper zookeeper-1:2181 --topic test-topic --partitions 6 --replication-factor 2
```

Re-Run the command to list the topics.
```
kafka-topics --list --zookeeper zookeeper-1:2181
```
You should see the new topic you have just created. 

Delete: 

```
kafka-topics --delete  --zookeeper zookeeper-1:2181 --topic test-topic 
```

### Describe a Topic

You can use the `--describe` option to get details on a specific topic, such as the distribution of the partitions over the cluster nodes (aka brokers).

```
kafka-topics --describe --zookeeper zookeeper-1:2181 --topic test-topic
```
The output will look similar to this one - but will most likely not be exactly the same because the distribution of partitions over brokers is dynamic.
```
Topic:test-topic	PartitionCount:6	ReplicationFactor:2	Configs:
	Topic: test-topic	Partition: 0	Leader: 3	Replicas: 3,2	Isr: 3,2
	Topic: test-topic	Partition: 1	Leader: 1	Replicas: 1,3	Isr: 1,3
	Topic: test-topic	Partition: 2	Leader: 2	Replicas: 2,1	Isr: 2,1
	Topic: test-topic	Partition: 3	Leader: 3	Replicas: 3,1	Isr: 3,1
	Topic: test-topic	Partition: 4	Leader: 1	Replicas: 1,2	Isr: 1,2
	Topic: test-topic	Partition: 5	Leader: 2	Replicas: 2,3	Isr: 2,3
```

### Produce and Consume to Kafka topic with command line utility

Now let's see the topic in use. The most basic way to test it is through the command line. Kafka comes with two handy utilities `kafka-console-consumer` and `kafka-console-producer` to consume and produce messages through the command line; these utilities run on the any Kafka broker, including the one you are currently connected to. You can publish your first message to a Kafka Topic for example with this command:

```
echo "This is my first message!" | kafka-console-producer --broker-list kafka-1:19092,kafka-2:19093 --topic test-topic
```

There is also an even more convenient command line tool - *kcat* previously known as *kafkacat* - that runs in a different container. 

Click on the plus sign on the right side of the screen to launch a new terminal; select `bash` as the terminal type. 

Execute this command in the new terminal to launch yourself right into this container:

```
docker exec -ti kafkacat sh
```

You can now start executing `kafkacat` commands - to inspect, produce to and consume from Kafka topics. Let's first inspect the `test-topic`:

```
kafkacat -L -b kafka-1:19092 -t test-topic
```

You will get some details on the nature of the `test-topic`.

Next, to consume all messages from the `test-topic`, execute this next command:

```
kafkacat -C -b kafka-1:19092 -t test-topic
```

This will list the message "This is my first message!" that was published to the topic earlier on. Note that `kafkacat` keeps on listening to the topic for more messages to appear. You can quit this *session* with `CTRL+C`.


Click on the plus sign on the right side of the screen to launch another new terminal that we will use for publishing messages to the topic; select `bash` as the terminal type. 

Execute this command in the new terminal to launch yourself right into this container:

```
docker exec -ti kafkacat sh
```

As before, you can now execute  `kafkacat` commands - to inspect, produce to and consume from Kafka topics. Let's produce a message:

```
kafkacat -P -b kafka-1:19092 -t test-topic
```

You are now in a production session: every line of text you type is produced as a message when you press enter. Type a few lines of text. Use `CTRL+Z`

cat > file.txt

Enter some text, type enter, type some more text and press enter again. Perhaps one or two additional lines. Then `CTRL+Z` to quite the editing session.

Use `cat file.txt` to inspect the contents of the file you have created.

Execute this command to have every line in the file published as a message to the test-topic:

```
kafkacat -P -b kafka-1:19092 -t test-topic -l file.txt
```

Or this command to have the entire file published as a single message to the test-topic:

```
kafkacat -P -b kafka-1:19092 -t test-topic file.txt
```








## Using Apache Kafka HQ

[Apache Kafka HQ](https://akhq.io/) is an open source tool for managing a Kafka cluster: a GUI for Apache Kafka® to manage topics, topics data, consumers group, schema registry, connect and more...It has been started as part of the **Kafka platform ** and can be reached on <http://kafka:28042/> (provided you added the IP address to the *hosts* file associated with the host name *kafka*, and otherwise at http://192.168.188.110:28042/ or http://127.0.0.1:28042/.

The first page in AKHQ shows an overview of the cluster and its nodes. Note: the connection from AKHQ to the Kafka platform is defined in docker-compose.yml, that is where the name for the cluster ("docker-kafka-server") stems from.
![AKQH Nodes in Cluster](./images/akhq-nodes-1.png) 
You can inspect the details for each node - through the looking glass icon or just by clicking on the row for the node. This reveals the configuration settings for the node as well as an overview of the logs managed on the node/by the broker.
![AKQH Node Details](./images/akhq-nodes-2.png) 

The Topics page shows the topics currently created on the entire Kafka Cluster. You will see the *test-topic* that you have just created through the Kafka Console utility. If you show all topics, you will also see one or more internal topics, used by Kafka for housekeeping. The *__consumer_offsets* topic keeps track of the *read offset* for all consumers (or rather: for all consumer groups).

![AKQH Node Details](./images/akhq-topics-1.png) 

You can see the number of messages on the *test-topic* as well as the number of partitions and the replication factor. You can downdrill on the topic, to level of the actual messages in the message log:
![AKQH Node Details](./images/akhq-topics-2.png)
You should see the messages that you have just been producing through the Kafka Console. You can see the message's production time and offset, their size, key and contents and the partition to which they have been assigned. You cannot change any of these properties - the message log is immutable.

Other tabs in AKHQ for the topic provide access to the partitions (and their current offset), Consumer Groups consuming from the topic, the configuration, ACLs (Access Control Lists) and the message logs themselves. 

### Produce a message
Click on the button *Produce to Topic*. A window opens where you can define the message to produce. You only need to enter a message text. Then press Produce.
![AKQH Node Details](./images/akhq-produce-1.png)

You will see an indication that the message has been produced to the topic. 
![AKQH Node Details](./images/akhq-produce-2.png)

Now check in the Kafka Console terminal window where the Kafka Consumer is running. You will see your own message, produced from the AKHQ application to the *test-topic*. Note: this Kafka Console Consumer session has been associated with an auto-generated Consumer Group (console-consumer-<generated number>). When you stop and start the console consumer, you will continue to consume from the previous offset reached in the console - unless you specify the *from-beginning* switch. 

The message is also visible in AKHQ if you inspect the details for the *test-topic*. Note: the message may not have the highest offset of them all. The offset is defined per partition - so the offset value for your message depends on the previous offset in the specific partition selected by the Kafka Cluster for the message.
![AKQH Node Details](./images/akhq-produce-3.png)

When you produce a message in the Kafka Console, that message will of course show up in the GUI of AKHQ as well.


# Resources
A nice introductory article on Apache Kafka: [Part 1: Apache Kafka for beginners - What is Apache Kafka?](https://www.cloudkarafka.com/blog/2016-11-30-part1-kafka-for-beginners-what-is-apache-kafka.html)


Kafkacat - introduction to the command line utility: [Learn how to use Kafkacat – the most versatile Kafka CLI client](https://codingharbour.com/apache-kafka/learn-how-to-use-kafkacat-the-most-versatile-cli-client/)

