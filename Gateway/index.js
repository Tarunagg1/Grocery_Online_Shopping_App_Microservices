require('dotenv').config();
const express = require('express');
const cors = require('cors');
var proxy = require('express-http-proxy');



const app = express();

app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 8000;

app.use('/customer', proxy('http://localhost:8001'));
app.use('/shopping', proxy('http://localhost:8003'));
app.use('/', proxy('http://localhost:8002'));  // product




app.listen(PORT, function () {
    console.log('server listning on port ' + PORT);
})