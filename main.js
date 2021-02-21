const express = require('express');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const rateLimter = require('./util/RateLimiter');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 8080;


app.use(express.static('public'));

app.use((req, res, next) => {
    const parsedQs = querystring.parse(url.parse('http://localhost:8080' + req.originalUrl).query);
    req.urlParams = parsedQs;
    next();
});

app.use(rateLimter);

app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`The server runnig on ${port}`)
})

app.get('/', (req, res) => {
    res.send("read the docs in http://localhost:8080/docs/")
})

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: `DripDevelopment - API`,
            description: 'DripDevelopment'
        },
        servers: ['http://localhost:8080']
    },
    apis: [__dirname + '/Routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const setFolder = (dir) => {
    const routes = fs.readdirSync(dir);
    routes.forEach(route => {
        if (route.endsWith('.js')) setFile(dir + '/' + route);
        else setFolder(dir + '/' + route);
    });
};
const setFile = (dir) => {
    const file = require(dir);
    app.use(file.end, file.router);
};

const Init = async () => {

    await require('./Database/Init')();
    process.s = new (require('./Database/UserManager'))();

    const routes = fs.readdirSync(__dirname + '/Routes');
    routes.forEach(route => {
        if (route.endsWith('.js')) setFile(__dirname + '/Routes/' + route);
        else setFolder(__dirname + '/Routes/' + route);
    });

    app.use((req, res, mext) => {
        if (req.originalUrl.startsWith('/docs/') || req.originalUrl == '/') return next();
        return res.status(404).json({
            error: true,
            message: 'Invalid endPoint'
        })
    })

    app.listen(port, () => console.log('on port: ' + port));

};

Init();