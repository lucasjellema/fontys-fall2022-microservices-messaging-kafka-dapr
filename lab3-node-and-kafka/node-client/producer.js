const { Kafka, logLevel } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'],
  logLevel: logLevel.INFO
})


const producer = kafka.producer()

const produceMessage = async (message) => {
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { key: "2", value: message },
    ],
  })

  await producer.disconnect()
  console.log("Done Producing")
}

produceMessage(`Here I am telling you a story`)

