var boxObject = require('../service/boxservice');
var adpService = require('../service/adpservice');
var qService  = require('../service/mqservice');
exports.downloadFileFrmBox = async (input) => {
    console.log("Donwload process starts here ");
    var adpresponse =[];
       const x = await boxObject.getFileIds(input);
       const y = await startIteration(x.entries,adpresponse,input); 
      return adpresponse;           
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