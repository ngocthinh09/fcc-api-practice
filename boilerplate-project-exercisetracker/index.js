const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

const mongodb = require('./myApp');
mongodb.connect();

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await mongodb.createUser(username);
    res.json({ username: user.username, _id: user._id })
  } catch (err) {
    res.json({ error: "Could not create user", description: err });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await mongodb.getAllUsers();
    res.json(allUsers);
  } catch (err) {
    res.json({ error: "Could not get all users", description: err})
  }
});


app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const result = await mongodb.addExercise(userId, { 
      description, 
      duration, 
      date 
    });
    res.json(result);
  } catch (err) {
    res.json({ error: "Could not add exercise", description: err});
  }
});


app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const logs = await mongodb.getLogs(userId, { from, to, limit });
    res.json(logs);
  } catch (err) {
    res.json({ error: "Could not fetch logs" });
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
