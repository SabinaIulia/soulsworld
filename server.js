const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const path = require('path');
const { response } = require('express');

const app = express();
app.use(express.json());
app.use(cors());
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'stopThere',
      database : 'soulsworld'
    }
});

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
   db.select('email', 'hash').from('login')
   .where('email', '=', req.body.email)
   .then(data => {
     const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
     if (isValid) {
        return db.select('*').from('users')
         .where('email', '=', req.body.email)
         .then(user => {
             res.json(user[0])
         })
         .catch(_err => res.status(400).json('Cannot get user'))
     } else {
          res.status(400).json('Wrong credentials')
     }
   })
   .catch(_err => res.status(400).json('Wrong credentials'))
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        
    .catch(err => res.status(400).json('Cannot register')) 
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    })
    if (!found) {
        res.status(400).json('Not found')
    }
});

app.put('/image', (req,res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++
            return res.json(user.entries);
        }
    })
    if (!found) {
        res.status(400).json('Not found')
    }
});

app.listen(3000, ()=> {
    console.log('app is running');
});