const { Kafka, logLevel } = require('kafkajs')

const topic ="test-topic"

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'],
  logLevel: logLevel.INFO
})

let messageCounter = 1;

const producer = kafka.producer()

const produceMessage = async (message) => {
    await producer.send({
      topic: topic,
      messages: [
        { key: messageCounter.toString(), value: message },
      ],
    })
  }

  const initializeProducer = async () => {
    await producer.connect()
    console.log("Producer Ready for Producing")
  }

  initializeProducer()

module.exports = {  produceMessage };