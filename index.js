const express = require('express');
const app = express();
const cors = require('cors');
const { config } = require('./config');

app.use(cors());
app.use(express.json());

//Routes
const dniAPI = require('./routes/dni');
dniAPI(app);

app.listen(config.port, () => {
    console.log(`Listening http://localhost:${config.port}`);
});
