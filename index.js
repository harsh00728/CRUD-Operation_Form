const express= require("express");
const app= express();
const port= 8080;
const mysql= require('mysql2');
const path= require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride= require("method-override");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const connection= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'formdb',
    password: 'MySQL@pratap06'
  });

// Server WakeUp. 
app.listen(port, ()=> {
    console.log("Server is Listening");
});

// home page.
app.get("/home", (req, res)=> {
    let q= "SELECT * FROM details" ;
    try{
        connection.query(q, (err, result)=> {
            if(err) throw err;
            let members= result;
            res.render("home.ejs", {members});
        }); 
    } catch(err){
        console.log(err);
        res.send("some err in DB");
    }
});

// New Form.
app.get("/home/form", (req,res)=> {
    res.render("form.ejs");
});

// New Data Entry into form after submitting form.
app.post("/home/post", (req, res)=> {
    let {firstname, middlename, lastname, gender, locality, city, state, pincode, phone1, phone2, email, password}= req.body;
    let id= uuidv4();
    let data= [`${id}`, `${firstname}`, `${middlename}`, `${lastname}`, `${gender}`, `${locality}`, `${city}`, `${state}`, pincode, phone1, phone2, `${email}`, `${password}`];
    console.log(data);
    let q= "INSERT INTO details (id, firstname, middlename, lastname, gender, locality, city, state, pincode, phone1, phone2, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" ;
    try{
        connection.query(q, data, (err, result)=> {
            if(err) throw err;
            console.log(result);
            res.redirect("/home");
        }); 
    } catch(err){
        console.log(err);
        res.redirect("/home");
    }
});

// view page.
app.get("/home/view/:id", (req, res)=> {
    const {id}= req.params;
    let q= `SELECT * FROM details WHERE id= "${id}" ` ;
    try{
        connection.query(q, (err, result)=>{
            if(err) throw err;
            let member= result[0];
            res.render("view.ejs", {member});
        });
    } catch(err){
        console.log(err);
        res.redirect("/home");
    }
});


// Edit Routes:-

// get edit form.
app.get("/home/form/:id", (req,res)=> {
    const {id}= req.params;
    let q= `SELECT * FROM details WHERE id= "${id}" ` ;
    try{
        connection.query(q, (err, result)=> {
            if(err) throw err;
            let member= result[0];
            res.render("edit.ejs", {member});
        });
    } catch(err){
        console.log(err);
    }
});

// patch update route.
app.patch("/home/:id", (req, res)=> {
    let {id}= req.params;
    let {locality, city, state, pincode, phone1, phone2, email, password: frompassword}= req.body;
    let q1= `SELECT * FROM details WHERE id= "${id}" `; 
    try{
        connection.query(q1, (err, result)=>{
            if(err) throw err;
            let oldPassword= result[0].password;
            if(oldPassword != frompassword){
                res.redirect("/home");
            } else{
                let q2= `UPDATE details 
                        SET locality= "${locality}", city= "${city}", state= "${state}", pincode= ${pincode},
                        phone1= ${phone1}, phone2= ${phone2}, email= "${email}" 
                        WHERE id= "${id}" ` ;

                connection.query(q2, (err, result)=> {
                    if(err) throw err;
                    res.redirect("/home");
                });        
            }  
        });
    } catch(err){
        console.log(err);
        res.send("Some err in DB");
    }
});


// delete Route.
app.delete("/home/delete/:id", (req, res)=> {
    let {id}= req.params;
    let q= `DELETE FROM details WHERE id= "${id}" `;
    try{
        connection.query(q, (err, result)=> {
            if(err) throw err;
            res.redirect("/home");
        });
    } catch(err){
        console.log(err);
        res.send("Some error in DB")
    }
});