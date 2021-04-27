// const { static } = require('express');
const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const app = express();
const axios = require('axios');
require('./config/passport')(passport);
const path = require('path');
const port = process.env.port || 3000;
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
const bodyParser = require('body-parser');
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}))
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use(bodyParser.urlencoded({
    extended : false
}));
app.set('view engine','ejs'); 
app.use(express.static(path.join(__dirname ,'public')));

const connectdb = require('./server/db/connection');

const morgan = require('morgan');
// moragan is used to print log messages
app.use(morgan('tiny'));

// const BSE = require('sharewatch').BSE;
// const { exit } = require('process');

let bsecode =[500325,532540,500180,500209,500696,500010,532174,500247,500112,500034,532454,500875,532281,507685,500820,532215,532500,500510,540376,532538,541450,532978,500790,524715,540777,532921,500312,500188,500114,532898,532977,500520,532555,500387,500570,532755,543066,500228,532488,500547,530965,500096,500331,540719,533278,512599,539254,532187,500825,500300,500124,500470,532868,532424,509480,517354,500295,505200,534816,540133,500440,540716,500182,517334,540005,532777,532155,500550,500087,541729,539448,500800,542066,531642,500425,541153,524804,533398,532523,500257,532321,500530,532461,511243,500830,500420,512070,532134,508869,500459,500302,532432,500490,532648,543245,533155,517174,533150,532514,532522,542830,532827,540376,500290,532822,500477,505537,540115,540691,532483,540762,535755,500126,500877,543248,540173,540064,530005,539542,532839];

let data=[];
const BSE = require('sharewatch').BSE;
    for(let i=0;i<bsecode.length;i++)
    {
    (BSE.quote(bsecode[i]))
    .then((result) => { 
        if (result.CurrVal)
     {
         if(result.Scripname=='TCS')
            console.log(result.Scripname+'  '+result.CurrVal+' '+result.CurrDate);
            data.push(result);
      }
            else
            {
                console.log('no value for '+bsecode[i]);
            }
        }).catch((err) => {
            // console.log(err);
            // exit(1);
        });
    }  
app.get('/',(req,res)=>{
    res.render('index.ejs');
})

app.get('/live',(req,res)=>{
    
    res.render('live.ejs',{
        user,
        data
    })
})

var userdb = require('./server/model/user');
const { response, json } = require('express');
// const { Passport } = require('passport');
app.post('/register',(req,res)=>{
        let errors=[];
        console.log(req.body);
        const name = req.body.name;
        const userid=req.body.userid;
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if(!name || !userid || !password || !cpassword)
        {
            errors.push({msg: "please fill in all the fields!"});
        }
        // console.log(req.body);
        if(password!=cpassword)
        {
            res.send('passwords not matching');
            // window.alert('passwords not matching!');
            errors.push({msg: 'passwords not matching!'});
        }
        else{
            userdb.findOne({userid : userid})
            .then(user=>{
                if(user)
                {
                    res.send('UserId already exists!!');
                }
                else{
                    const user = new userdb({
                       name,
                       userid,
                       password
                    });
                    console.log(user);
                    // hash password!!
                    bcrypt.genSalt(10,(err,salt)=>{
                       bcrypt.hash(user.password,salt,(err,hash)=>{
                        //    if(err) throw err;
                           user.password = hash;
                           user.save()
                           .then(user=>{
                                 res.redirect('/')
                            //    res.render('index.ejs');
                           })
                           .catch(err=>{
                               console.log(err);
                           })
                       })
                    })
                }
            })
        }
            // new user, add it to the db!!
            // console.log(req.body.userid);
})
// app.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//       successRedirect: '/dashboard',
//       failureRedirect: '/',
//       failureFlash: true
//     })(req, res, next);
//   });
userdb = require('./server/model/user');
app.post('/login',(req,res)=>{
    // console.log(req.body);
    let userid=req.body.userid;
    const password = req.body.password;
    // console.log(userid);
    userdb.findOne({userid:userid})
    .then(user=>{
        // console.log(user);
        if(!user)
        {
            res.send('no user with that userid!!');
        }
        else{
        bcrypt.compare(password,user.password,(err,ismatch)=>{
            // console.log(user.pass);
            if(ismatch)
            {
                res.render('live.ejs',
                {
                    user,data
                });
            }
            else{
                res.send('password incorrect!!');
            }
        })
    }
    })
})
  // Logout
  app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });

app.get('/buy',(req,res)=>{
   let sname = req.query.stock
   let currval=req.query.currval;
   let userid = req.query.user;
//   var x =JSON.parse(JSON.stringify(user));
   console.log(sname+" "+currval+" "+userid);
    // console.log(req.query.user);
    res.render('buy.ejs',{
        stockname: sname,
        currval: currval,
        userid: userid
    });
})

var holding = require('./server/model/holding');
var transdb = require('./server/model/transaction');
app.post('/buy',(req,res)=>{
let userid = req.body.userid;
let currval = req.body.currval;
let stockname = req.body.stockname;
let quantity = req.body.quantity;
let cash;
let required = quantity*currval;
let newtrans = new transdb({
    userid: userid,
    stockName : stockname,
    price : currval,
    quantity: quantity,
    type: "buy"
})
console.log('required amount is '+required);
userdb.findOne({userid:userid})
.then(user=>{
    // console.log(user);
cash = user.cash;
console.log('cash is '+cash);
holding.findOne({userid:userid,stockname:stockname})
.then(hainkya=>{
    let newcash = parseFloat(cash)-parseFloat(required);
    let newStockval = parseFloat(user.stockVal)+parseFloat(required)
    console.log(newcash);
    console.log(newStockval);
    // console.log('type of req '+typeof(required));
    // console.log('type of cash '+typeof(cash));
    if(!hainkya)
    {
        if(required>cash)
        {
            console.log('insuff')
             res.send('insufficient cash to buy '+quantity+' stocks, maximum buy can be '+cash/currval);
        }
        else{
            // user can buy the stock, so update in transaction,holding and userdb!!!
            const newbuy = new holding({
                userid: userid,
                stockname: stockname,
                quantity: quantity,
                price  : currval
            });
            newbuy.save()
            .then()
            .catch();

            newtrans.save()
            .then()
            .catch ();

            console.log('suffcient funds aur nhi tha pehele se!!');
            userdb.updateOne({
                userid: userid
                },
                { $set:{
                    stockVal : newStockval,
                    cash: newcash
                }
            }).then(up=>{

            }).catch(err=>{

            })
        }
    }
    else
    {
        console.log('pehele se hee kuch hain!!');
        if(required>cash)
        {
            console.log('insuff')
            res.send('insufficient cash to buy '+quantity+' stocks, maximum buy can be '+cash/currval);
        }
        else{
        // now you have to average out the price!!
        let currquant = hainkya.quantity;
        let currprice = hainkya.price;
        // console.log('currq '+currquant+'currprice: '+currprice);
        // console.log(quantity);
        // console.log(price);
        let newprice = ((parseFloat(currquant)*parseFloat(currprice))+(parseFloat(quantity)*parseFloat(currval)))/(parseFloat(currquant)+parseFloat(quantity));
        console.log(newprice);
        let newquant =  parseFloat(currquant)+parseFloat(quantity);
        console.log(typeof(newquant));
        holding.updateOne(
            {
                userid: userid,
                stockname: stockname
            },
            { $set:
            {
                price: newprice,
                quantity: newquant
            }
        }
        ).then(hua=>{
            // console.log(hua);
        })
        .catch(err=>{
            console.log('error');
        });
        
        newtrans.save()
        .then()
        .catch();

        userdb.updateOne({
            userid: userid
            },
            { $set:{
                stockVal : newStockval,
                cash: newcash
            }
        }).then(up=>{
        }).catch(err=>{
        })
    }
   }
})
})
})

app.get('/sell',(req,res)=>{
    let sname = req.query.stock
    let currval=req.query.currval;
    let userid = req.query.user;
 //   var x =JSON.parse(JSON.stringify(user));
    console.log(sname+" "+currval+" "+userid);
     // console.log(req.query.user);
     res.render('sell.ejs',{
         stockname: sname,
         currval: currval,
         userid: userid
     });
 })

 app.post('/sell',(req,res)=>{
    let userid = req.body.userid;
    let currval = req.body.currval;
    let stockname = req.body.stockname;
    let quantity = req.body.quantity;
    let availquant;
    let gain = quantity*currval;
    let newtrans = new transdb({
        userid: userid,
        stockName : stockname,
        price : currval,
        quantity: quantity,
        type: "sell"
    })                   
console.log('gain amount is '+gain);
userdb.findOne({userid:userid})
.then(user=>{
    // console.log(user);
cash = user.cash;
holding.findOne({userid:userid,stockname:stockname})
.then(hainkya=>{
    let newcash = parseFloat(cash)+parseFloat(gain);
    let newStockval = parseFloat(user.stockVal)-parseFloat(gain);
    if(!hainkya)
    {
       res.send('you do not own any shares of '+stockname);
    }
    else
    {
        availquant = hainkya.quantity;
        console.log('pehele se hee kuch hain!!');
        if(quantity>availquant)
        {
            console.log('insuff shares')
            res.send('you currently hold '+availquant+' shares of '+stockname+' ,therfore maximum share you can sell is '+availquant);
        }
        else
        {
            // sufficient shares to sell!!            
        let buyprice = hainkya.price;
        let newquant =  parseFloat(availquant)-parseFloat(quantity);
        
        newtrans.save()
        .then()
        .catch();

        userdb.updateOne({
            userid: userid
            },
            { $set:{
                stockVal : newStockval,
                cash: newcash
            }
        }).then(up=>{
        }).catch(err=>{
        })
        if(newquant===0)
        {
            holding.remove({
                userid: userid,
                stockname: stockname
            })
            // delete from current holdings
        }
        else{
            holding.updateOne(
                {
                    userid: userid,
                    stockname: stockname
                },
                { $set:
                {
                    quantity: newquant
                }
            }
            ).then(hua=>{
                // console.log(hua);
            })
            .catch(err=>{
                console.log('error');
            });
        }
      }
   }
})
})
})
  transdb = require('./server/model/transaction');
app.get('/transaction',(req,res)=>{
    let userid = req.query.userid;
    console.log(userid);
  
    transdb.find({userid : userid})
    .then(res2=>{
        console.log(res2);
        // let jsontrans = res2.toJSON();
        res.render('transaction.ejs',{
            transaction : res2, 
            user : userid
        })
    })
    .catch(err=>{
        console.log('error occured,while fetching value!!');
    })
})
app.listen(port,()=>{
    console.log('okay');
});
app.get('/portfolio',(req,res)=>{
    let user;
    let userid = req.query.userid;
     console.log(userid);
    userdb.findOne({userid : userid})
    .then(res2=>{
        user = res2;
        holding.find({userid : userid})
        .then(result=>{
            console.log(result);
            // let jsontrans = res2.toJSON();
            res.render('portfolio.ejs',{
                holding : result, 
                user : user
            })
        })
        .catch(err=>{
            console.log('error occured,while fetching value!!');
        })
    }).catch();
  
})
connectdb();