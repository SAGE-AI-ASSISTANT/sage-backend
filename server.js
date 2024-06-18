const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const auth = require('./routes/api/auth');
const upload = require('./routes/api/upload');
const course = require('./routes/api/course');
const chat = require('./routes/api/chat');


const app = express();

// Enable cors middleware
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = process.env.localURI;

// Connect to the mongodb
mongoose.connect(db || process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Passport Middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/auth', auth);
app.use('/api/upload', upload);
app.use('/api/course', course);
app.use('/api/chat', chat)

app.use(express.static('public'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`App has Started on port ${port}`);
});