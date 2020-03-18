const express = require ('express');
const app = express();
const path = require('path');
const inputValidation = require('./helpers/inputValidation.js');

app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
 
// parse application/json
app.use(express.json());

let users = [
    {
        "id": 1,
        "name": "sebi",
        "age": 24
    },
    {
        "id": 2,
        "name": "ana",
        "age": 22,
    }
]

let currentID = 2;

// app.get('/search', (req, res) => {
//     return res.send({color: req.query.color});
// });

// Get user
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(user => user.id === Number(id));
    return res.send(user);
});

app.get('/', (req, res) => {
    return res.sendFile(`${__dirname}/public/index.html`);
});

// Get all users
app.get('/users', (req, res) => {
    return res.send(users);
});

// Create user
app.post('/users', (req, res) => {
    const newUser = req.body;
    for(let property in newUser) {
        const value = newUser[property];
        const isInputValid = inputValidation.validateInput(property, value);
        if(!isInputValid) {
            return res.send({ status: 0, error: `Property ${property} with value ${value} is not valid` }); 
        } else {
            newUser[property] = inputValidation.bypassInput(property, value);
        }
    }
    const newCreatedUser = { id: ++currentID, ...newUser};
    users.push(newCreatedUser);
    return res.send({ status: 1, createdUser: newCreatedUser });
});

// Delete user
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    let deletedUser;
    users = users.filter(user => { 
        if(user.id === Number(id)){
            deletedUser = user;
        }
        return user.id !== Number(id);
    });
    if(!!deletedUser) {
        return res.send({ status: 1, deleted: deletedUser });
    } else {
        return res.send({ status: 0, deleted: 'Nothing to delete' });
    }
});

// Update user
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const foundIndex = users.findIndex(user => user.id === Number(id));
    if(foundIndex >= 0) {
        let newUser = req.body;
        for(let property in newUser) {
            if(property !== 'id') {
                const value = newUser[property];
                const isInputValid = inputValidation.validateInput(property, value);
                if(!isInputValid) {
                    return res.send({ status: 0, error: `Property ${property} with value ${value} is not valid` }); 
                } else {
                    newUser[property] = inputValidation.bypassInput(property, value);
                }
            }
        }
        newUser = { ...users[foundIndex], ...req.body };
        users[foundIndex] = newUser;
        return res.send({ status: 1, updated: users[foundIndex] });
    }
});

app.listen(9090, (err) => { 
    if(err) {
        return console.log('Error', err);
    }
    console.log('Server running on port 9090')
    
});