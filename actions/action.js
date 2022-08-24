var boxObject = require('../service/boxservice');
var adpService = require('../service/adpservice');
var qService  = require('../service/mqservice');
exports.downloadFileFrmBox = async (input) => {
    console.log("Donwload process starts here ");
    var adpresponse =[];
       const x = await boxObject.getFileIds(input);
       if(x.entries && x.entries.length > 0){
        const y = await startIteration(x.entries,adpresponse,input); 
       }
       
       var response ={
        "message":"",
        "data":"",
        "statuscode":""

       }
       response.message = (adpresponse.length && adpresponse.length != 0 ) ? "Success":(x.entries == 0 ?"Source Folder Doesn't has any file to process":(x.statusCode == 404 ? "source folder is not available & give me correct folder Id":"Failed"));
       response.statuscode = (adpresponse.length && adpresponse.length != 0 ) ? 200:(x.entries == 0 ?202:(x.statusCode == 404 ? 404:500));
       response.data = (adpresponse && adpresponse.length >0) ? JSON.parse(adpresponse):"" ;
      //  response.statuscode = 
      return response;           
}


const startIteration = async(array,adpresponse,input)=>{
    
    for(var num of array){
      const a = await boxObject.downloadFile(num);
      var d = await adpService.storeInDB(num,input);
      var c = await adpService.invokeADP(a,num);
        qService.publishToQueue(c,num,d,input);
      if(JSON.parse(c).status.code == 202){
         await boxObject.moveFileIds(num,input);
        
      }
      adpresponse.push(c);
    }  
    
  } ;