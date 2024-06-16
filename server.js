const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { Session } = require("inspector");
const { error } = require("console");
const app = express();
const PORT = 3000;

// create MySQL connection
const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expensesdb'
});
//connect to MySQL
connection.connect ((err) =>{
    if (err) {
        console.error("Error connecting to MySQL:" + err.stack);
        return;
    }
    console.log ('connected to MySQL ad id' + connection.threadId);
    
});

//server static files from the default directory
app.use(express.static(path.join(__dirname, "public")));
//set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true}));
app.use(bodyParser.urlencoded({ extended:true}));
//define routes
app.get("/data", (req, res) => {
  fs.readFile(path.join(__dirname, "data.JSON"), "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading data");
      return;
    }
    res.json(JSON.parse(data));
  });
});
//define a user
const User = {
    tablename: 'users',
    createUser: function(newUser, callback){
        connectiom.query('INSERT INTO' + this.tablename + 'SET?' , newUser, callback);

    },
    getUserByEmail: function(email, callback){
        connection.query('SELECT * FROM' + this.tablename + 'WHERE email = ?' , email, callback);
    },
    getUserByUsername: function(Username, callback){
         connection.query('SELECT * FROM' + this.tablename + 'WHERE username = ?', Username, callback);

    }
};
    //registration route
    app.post('/register',[
        //validate email and username fields
        check('email') .isEmail(),
        check('username') .isAlphanumeric(). withMessage('Username must be alphanumeric'),
        //custom validation to check if email and username are unique
        check('email').custom(async (value) =>{
            const user = await User.getUserByEmail(value);
            if (user){
                throw new Error ('Email already exists');
            }
        }),
        check('username').custom(async (value)=>{
            const user = await User.getUserByUsername(value);
            if (user){
                throw new Error('Username already exists');
            }
        }),
    ]), async (req, res) => {
        //check for validation errors
        const errors = validationResult(req);
        if (!errors.IsEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //Hash the password
        const saltRounds = 10;
        const hashedPasswords = await bcrypt.hash (req.body.password, saltRounds);
        //create a new user object
        const newUser = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          full_name: req.body.full_name,
        };
        //insert user into MySQL
        user.createUser(newUser, (error, results, fields)=> {
            if (error){
                console.error('Error inserting user: ' + EvalError.message);
                return res.status(500).json({ error: error.message });
            }
            console.log('Inserted a new user with id' + results.inserted);
            res.status(201).json(newUser);
        });
    };
    //log in route
    app.post('/login', (req, res) =>{
        const {username, password} = req.body;
        //Retrieve user from database
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results)=>(
            if (err) throw err;
            if (results.length === 0){
                res.status(401).send('invalid username or password');
            }else{
                const user = results[0];
                //compare passwords
                bcrypt.compare(password, user.password, (err, isMatch)=>(
                    if (err) throw err;
                    if (IsMatch) {
                        //store user in session
                        req.session.user = user;
                        res.send('Login sucessful');
                    }else {
                        res.status(401).send('Invalid username or password');
                    }
                ));
            }
        ));
    });
    //logout route
    app.post('/Logout', (req, res) =>{
        req.session.destroy();
        res.send('/Logout successful');
    })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
