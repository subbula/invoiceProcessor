const axios = require('axios').default;
var https = require("https");
var request = require('request');
var fs = require('fs');


var agent = new https.Agent({
    rejectUnauthorized: false
});

exports.invokeADP = async (files) =>{

      const authToken   =  await getAccessToken();
      const adpresponse = await connectADP(files,authToken);
      return adpresponse;

};

const getAccessToken = async () =>{

    const authtoken = await axios.get('https://cpd-cp4ba.itzroks-550003xq0r-mgou7x-4b4a324f027aea19c5cbc0c3275c4656-0000.us-east.containers.appdomain.cloud/v1/preauth/validateAuth',{httpsAgent:agent, headers:{"Authorization":"Basic Y3A0YWRtaW46bk9CajRGOWhiMkUyamtKMU5wdmI="}})

    return authtoken.data.accessToken;
    

}



function postInvoicestoADP(fileContentJson,accesstoken){
    var formData = {
        headers: { 'Content-Type': 'application/form-data','Authorization': 'Bearer '+accesstoken },
        url:"https://cpd-cp4ba.itzroks-550003xq0r-mgou7x-4b4a324f027aea19c5cbc0c3275c4656-0000.us-east.containers.appdomain.cloud/adp/aca/v1/projects/0826e8eb-4b26-426e-80e9-36214f8d292e/analyzers",
        form:{
            responseType: 'json',
            jsonOptions: "ocr,dc,kvp,sn,hr,th,mt,ai,ds,char",
            file:fileContentJson,
        }  
    } 

    return new Promise ((resolve,reject)=>{

      axios.post(formData.url,formData.form,{httpsAgent:agent, headers:formData.headers})
  
      .then(function (response) {
         
        console.log(response);
        resolve(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        // resolve(error)
      }) 
  
     })
   
}


const connectADP = async (fileContentJson,accesstoken)=>{
  var data ={
    "rejectUnauthorized": false,
    "url": "https://cpd-cp4ba.itzroks-550003xq0r-mgou7x-4b4a324f027aea19c5cbc0c3275c4656-0000.us-east.containers.appdomain.cloud/adp/aca/v1/projects/0826e8eb-4b26-426e-80e9-36214f8d292e/analyzers",
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
    form.append('file', fs.createReadStream('./downloads/invonce.pdf'));
    form.append('jsonOptions','ocr,dc,kvp,sn,hr,th,mt,ai,ds,char');
    form.append('responseType','json');
    

  })
 
}

// invokeADP();