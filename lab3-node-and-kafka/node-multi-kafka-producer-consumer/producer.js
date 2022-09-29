const { Kafka, logLevel } = require('kafkajs')

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const kafka = new Kafka({
  clientId: 'multi-producer',
  brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'],
  logLevel: logLevel.INFO
})


const producer = kafka.producer()

const produceMessage = async (message) => {
  await producer.connect()
  let messageCount = 0
  while (messageCount++ < 20) {
    await producer.send({
      topic: 'test-topic',
      messages: [
        { key: "2", value: { "headline": message, "messageNumber": messageCount } },
      ],
    })
    await delay(700)
  }

  await producer.disconnect()
  console.log("Done Producing")
}

produceMessage(`Multi-producing power message`)

