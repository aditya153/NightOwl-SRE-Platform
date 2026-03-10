const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'event-dispatcher',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('[KAFKA] Producer connected successfully');
    } catch (error) {
        console.error('[KAFKA] Failed to connect producer', error);
        process.exit(1);
    }
};

const publishEvent = async (topic, eventData) => {
    try {
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify(eventData) }
            ],
        });
        console.log(`[KAFKA] Published event to topic: ${topic}`);
    } catch (error) {
        console.error(`[KAFKA] Error publishing to topic: ${topic}`, error);
    }
};

module.exports = {
    connectProducer,
    publishEvent
};
