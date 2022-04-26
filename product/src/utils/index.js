const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib')

const { APP_SECRET, MESSAGE_QUEUE_URL, EXCHANGE_NAME } = require('../config');

//Utility functions
module.exports.GenerateSalt = async () => {
        return await bcrypt.genSalt()
},

        module.exports.GeneratePassword = async (password, salt) => {
                return await bcrypt.hash(password, salt);
        };


module.exports.ValidatePassword = async (enteredPassword, savedPassword, salt) => {
        return await this.GeneratePassword(enteredPassword, salt) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
        return await jwt.sign(payload, APP_SECRET, { expiresIn: '1d' })
},

        module.exports.ValidateSignature = async (req) => {

                const signature = req.get('Authorization');

                console.log(signature);

                if (signature) {
                        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
                        req.user = payload;
                        return true;
                }

                return false
        };

module.exports.FormateData = (data) => {
        if (data) {
                return { data }
        } else {
                throw new Error('Data Not found!')
        }
}


// module.exports.PublishCustomeEvent = async (payload) => {
//         axios.post(`${process.env.CUSTOMER_SERVICE}/customer/app-event`, { payload });
// }

// module.exports.PublishShoppingEvent = async (payload) => {
//         axios.post(`${process.env.CUSTOMER_SERVICE}/shopping/app-event`, { payload });
// }

// message broker

module.exports.createChannel = async () => {
        try {
                const amqpServer = MESSAGE_QUEUE_URL;
                const connection = await amqp.connect(amqpServer)
                const channel = await connection.createChannel();
                await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
                return channel;
        } catch (error) {
                throw error;
        }
}

module.exports.PublishMessage = async (channel, binding_key, message) => {
        try {
                await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
        } catch (error) {
                throw error;
        }
}


module.exports.SubscribeMessage = async (channel, service, binding_key) => {
        const appQueue = await channel.assertQueue('QUEUE_NAME');

        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);
        channel.consume(appQueue.queue, data => {
                console.log('received message');
                console.log(data.context.toString());
                channel.ack(data);
        })
}



