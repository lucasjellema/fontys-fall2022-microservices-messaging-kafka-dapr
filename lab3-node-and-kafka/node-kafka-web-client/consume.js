const { Kafka, logLevel } = require('kafkajs')

const topic ="test-topic"

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'],
  logLevel: logLevel.INFO
})

const CONSUMER_GROUP_ID = "node-web-consumer"

const consumeMessages = async () => {
    const consumer = kafka.consumer({ groupId: CONSUMER_GROUP_ID })
  
    await consumer.connect()
    await consumer.subscribe({ topic: topic, fromBeginning: true })
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const prefix = `${topic}[${message.offset}] / ${message.timestamp}`
        console.log(`Consumed message - ${prefix} ${message.key}#${message.value}`)
        // add new messages at the top of the array
        messages.unshift(message.value.toString())
      },
    })
  }
  
let messages = []

consumeMessages()

console.log(`Consumer created to consume messages from topic ${topic}`);

const getMessages = function() {
    return messages
}
module.exports = {  getMessages };