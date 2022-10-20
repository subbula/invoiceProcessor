var boxObject = require('../service/boxservice');
var adpService = require('../service/adpservice');
var qService  = require('../service/mqservice');
exports.downloadFileFrmBox = async (x,input) => {
    console.log("Donwload process starts here ");
    var adpresponse =[];
      //  const x = await boxObject.getFileIds(input);
      //  if(x.entries && x.entries.length > 0){
        if(x && x.length > 0){
        const y = await startIteration(x,adpresponse,input); 
       }
              
}

exports.gettingResponse = async(input)=>{
  const x = await boxObject.getFileIds(input);
  var response ={
    "message":"",
    "data":"",
    "statuscode":""

   }
   response.message = (x.entries && x.entries != 0 ) ? "Success":(x.entries == 0 ?"Source Folder Doesn't has any file to process":(x.statusCode == 404 ? "source folder is not available & give me correct folder Id":"Failed"));
   response.statuscode = (x.entries && x.entries.length != 0 ) ? 200:(x.entries == 0 ?202:(x.statusCode == 404 ? 404:500));
   response.data = (x.entries && x.entries.length >0) ? x.entries:"" ;
   return response;   

}
const startIteration = async(array,adpresponse,input)=>{
    
    for(var num of array){
      const a = await boxObject.downloadFile(num);
      const d = await adpService.storeInDB(num,input);
      var c = await adpService.invokeADP(a,num);
        await qService.publishToQueue(c,num,d,input);
      if(JSON.parse(c).status.code == 202){
         await boxObject.moveFileIds(num,input);
        
      }
      adpresponse.push(c);
    }  
    
  } ;