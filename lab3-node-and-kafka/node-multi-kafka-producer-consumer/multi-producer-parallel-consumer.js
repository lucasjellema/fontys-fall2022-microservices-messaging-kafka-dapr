const { Kafka, logLevel } = require('kafkajs')
const https = require('https')

let greetingsArray = []
const productionInterval = 700 // time between the production of two subsequent messages in miliseconds
const consumptionInterval = 1000 // time it takes to process a single message - in milliseconds

https.get('https://raw.githubusercontent.com/chrisbuttery/greeting/master/greetings.json',
  function (res) {
    res.setEncoding('utf8');
    res.on('data', (chunk) => { // function to callback when body of http response is received
      greetingsArray = JSON.parse(`{ "data" : ${chunk} }`).data
    });
  })

function getRandomGreeting() {
  let randomGreetingIndex = Math.floor(Math.random() * greetingsArray.length)
  return (greetingsArray.length <1 ? "Good Day" :greetingsArray[randomGreetingIndex])
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const kafka = new Kafka({
  clientId: 'multi-producer',
  brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'],
  logLevel: logLevel.INFO
})


const producer = kafka.producer()

const produceMessages = async (message, numberOfMessages = 20) => {
  await producer.connect()
  let messageCount = 0
  while (messageCount++ < numberOfMessages) {
    await producer.send({
      topic: 'test-topic',
      messages: [
        { key: messageCount.toString(), value: JSON.stringify({ "headline": message, "messageNumber": messageCount, "greeting": getRandomGreeting() }) },
      ],
    })
    console.log(`>>> Produced message ${messageCount} to topic`)
    await delay(productionInterval)
  }

  await producer.disconnect()
  console.log(">>> Done Producing")
}

const consumeMessages = async (consumerGroupId = 'test-group') => {
  const consumer = kafka.consumer({ groupId: consumerGroupId })

  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[partition ${partition} | offset ${message.offset}] / ${message.timestamp}`
      console.log(`<<< Consumer Team ${consumerGroupId} reports message - ${prefix} ${message.key}#${message.value}`)
      await delay(consumptionInterval) // processing one message takes a little bit longer than the time between two messages on the producing end
    },
  })
}

consumeMessages('blueTeam')
consumeMessages('blueTeam')
consumeMessages('redTeam')


produceMessages(`Multi-producing power message`, 20)

