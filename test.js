var BoxSDK = require('box-node-sdk');
const { callbackify } = require('util');
var boxConfig = require('./bikram_box_config.json');
var adpService = require('./service/adpservice');
var fs = require('fs');
// var down=require('./downloads')

var sdk = new BoxSDK({
    clientID: process.env.clientId || boxConfig.boxAppSettings.clientID,
    clientSecret: process.env.clientSecret || boxConfig.boxAppSettings.clientSecret,
    appAuth: {
        keyID:  boxConfig.boxAppSettings.appAuth.publicKeyID,
        privateKey: boxConfig.boxAppSettings.appAuth.privateKey,
        passphrase:  boxConfig.boxAppSettings.appAuth.passphrase,
        enterprise:  boxConfig.enterpriseID
    }
});

// Get the service account client, used to create and manage app user accounts
var serviceAccountClient = sdk.getAppAuthClient('enterprise', boxConfig.enterpriseID);


const downloadFile = (fileId) => {

  var fileContentJson = {};

  return new Promise((resolve, reject) => {

      serviceAccountClient.files.getReadStream(fileId, null)
          .then(stream => {

              var finalData = '';
              var bufs = [];

              stream.on("data", (chunk) => {
                  bufs.push(chunk);
              });

              stream.on("end", () => {
                  finalData = Buffer.concat(bufs)

                  fileContentJson["$content-type"] = "application/pdf";
                  fileContentJson["$content"] = new Buffer.from(finalData).toString('base64');

                  resolve(fileContentJson);
              })

          })
          .catch(error => reject(error));

  })
}

var array =[1,2];
  const startIteration = async(array)=>{
    for(var num of array){
      const a = await downloadFile('992165652628');
      // const b = await binary2pdfConversion(a);
      const c = await adpService.invokeADP(a);
    }
  } ;

  // const binary2pdfConversion = async(stream) =>{
  //   var fileContentJson =[];
  //   var finalData = '';
  //           var bufs = [];
      
  //           await stream.on("data", async(chunk) => {
  //               bufs.push(chunk);
  //           });
      
  //           await stream.on("end", () => {
  //               finalData = Buffer.concat(bufs)
      
  //               fileContentJson["$content-type"] = "application/pdf";
  //               fileContentJson["$content"] = new Buffer.from(finalData).toString('base64');
  //               return fileContentJson;
       
  //         })
   
  //   // var output =  fs.createWriteStream('./downloads/file1.pdf');
	//   // stream.pipe(output)
  // }

  startIteration(array);
