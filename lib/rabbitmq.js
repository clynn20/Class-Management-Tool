const amqp = require('amqplib')

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost'
const rabbitmqUser = process.env.RABBITMQ_USER
const rabbitmqPass = process.env.RABBITMQ_PASS
const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}`;

let connection = null
let channel = null

exports.connectToRabbitMQ = async function (queue) {
    try {
        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();
        await channel.assertQueue(queue);
        console.log('Connected to RabbitMQ successfully');
      } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
      }
}

exports.getChannel = function () {
     return channel
}