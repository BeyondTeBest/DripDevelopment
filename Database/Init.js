const mongo = require('mongoose');
module.exports = async () => {
    const mongoURI = 'lol'
    mongo.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        useFindAndModify: false
    });

    await new Promise(res => {
        mongo.connection.once('connected', () => {
            console.log('MongoDB connected!');
            res();
        });

    })

};
