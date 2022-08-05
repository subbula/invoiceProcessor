var fs = require('fs');
var request = require('request');
require('dotenv').config();


const a = () =>{

  var data ={
    "rejectUnauthorized": false,
    "url": "https://cpd-cp4ba.itzroks-550003xq0r-mgou7x-4b4a324f027aea19c5cbc0c3275c4656-0000.us-east.containers.appdomain.cloud/adp/aca/v1/projects/0826e8eb-4b26-426e-80e9-36214f8d292e/analyzers",
    "method": "GET",
    "headers":{
        "Authorization": "Bearer " +process.env.token,
        "Content-Type": "application/json"
    }
  };
  return new Promise ((resolve,reject)=>{
  var req = request.post(data, function (err, resp, body) {
    if (err) {
      console.log('Error!',err);
    } else {
      console.log('URL: ' + body);
      resolve(body);
    }
  });
  var form = req.form();
  form.append('file', fs.createReadStream('./downloads/invonce.pdf'));
  form.append('jsonOptions','ocr,dc,kvp,sn,hr,th,mt,ai,ds,char');
  form.append('responseType','json');
  
});

}

const b = async () =>{
 await a();
 console.log("hello")
}
b();





