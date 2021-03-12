const { static } = require('express');
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.port || 3000;

app.set('view engine','ejs'); 
app.use(express.static(path.join(__dirname ,'public')));

const morgan = require('morgan');
// moragan is used to print log messages
app.use(morgan('tiny'));

// const BSE = require('sharewatch').BSE;
const { exit } = require('process');

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

app.get('/live',async (req,res)=>{
    
    res.render('live.ejs',{
        data
    })
})
app.listen(port,()=>{
    console.log('okay');
});