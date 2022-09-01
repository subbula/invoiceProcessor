const axios = require('axios').default;
var https = require("https");
var request = require('request');
var fs = require('fs');
var qService = require('./mqservice');

var agent = new https.Agent({
    rejectUnauthorized: false
});

exports.invokeADP = async (files,fileId) =>{

      const authToken   =  await getAccessToken();
      const adpresponse = await connectADP(files,authToken);
      return adpresponse;

};

const getAccessToken = async () =>{

    const authtoken = await axios.get(process.env.adpUrl +'/v1/preauth/validateAuth',{httpsAgent:agent, headers:{"Authorization":"Basic " +process.env.adpBasicToken}})

    return authtoken.data.accessToken;
    

}

exports.storeInDB = async (fileDetails,input) =>{

  var data ={
    "fileid": fileDetails.id ,
    "fileName": fileDetails.name,
    "processingState": "In-progress",
    "createdtime": new Date(),
    "updatedTime": new Date(),
    "userid":input.userId
  }

  const authtoken = await axios.post(process.env.dbAPI,data,{httpsAgent:agent,headers:{"Content-Type":"application/json"}})

  return authtoken.data;
  

}

const connectADP = async (fileContentJson,accesstoken)=>{
  var data ={
    "rejectUnauthorized": false,
    "url": process.env.adpUrl +"/adp/aca/v1/projects/"+process.env.adpProjectId+"/analyzers",
    "method": "GET",
    "headers":{
        "Authorization": "Bearer " +accesstoken,
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
    form.append('file', fs.createReadStream('./downloads/invoice.pdf'));
    form.append('jsonOptions','ocr,dc,kvp,sn,hr,th,mt,ai,ds,char');
    form.append('responseType','json');
    
  })
 
};

