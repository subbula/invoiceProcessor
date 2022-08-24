var BoxSDK = require('box-node-sdk');
const { callbackify } = require('util');
var boxConfig = require('../bikram_box_config.json');
var adpService = require('./adpservice');
var fs = require('fs');

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
    // var folder_id="133707165081";
    // var folder_id="168860931782";
    // var processed_folder_id="168945527405";
// }




exports.downloadFile = (fileId) => {

    var fileContentJson = {};
  
    return new Promise((resolve, reject) => {
  
        serviceAccountClient.files.getReadStream(fileId.id, null)
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
                    fs.writeFileSync('./downloads/invoice.pdf', finalData)
                    resolve(fileContentJson);
                })
  
            })
            .catch(error => reject(error));
  
    })
  }


exports.getFileIds = async(input)=>{
    try{
        const folderData = await serviceAccountClient.folders.getItems(input.fileLocation);
        return folderData;
    }
    catch(err){
     return err;
    }
    

}  

exports.moveFileIds = async(fileDetails,input)=>{
    const moveFolder = await serviceAccountClient.files.move(fileDetails.id,input.processedFileLocation);
    return moveFolder;

}  

