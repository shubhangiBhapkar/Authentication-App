const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config()
const cors = require('cors');
const connect_DB = require('./connect DB/connect_DB');



const app = express();

app.use(express.json());

app.use(cors())

app.use(morgan("dev"))

app.get("/test", (req, res) => {
    res.json("dasd")
})


app.use("/user", require("./User Routes/User Routes"))


app.listen(process.env.PORT, async () => {
    await connect_DB()
    console.log(`Sever is up at port ${process.env.PORT}`);
})