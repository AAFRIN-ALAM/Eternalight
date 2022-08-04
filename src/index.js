const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const cookieParser = require('cookie-parser')
const { default: mongoose } = require('mongoose');
const app = express();

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://Aafrin77:omaJBV2vPYhwOS7f@cluster0.ekfff.mongodb.net/Eternalight", {

    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});