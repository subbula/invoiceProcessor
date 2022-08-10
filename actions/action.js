var boxObject = require('../service/boxservice');
var adpService = require('../service/adpservice');
var qService  = require('../service/mqservice');
exports.downloadFileFrmBox = async (input) => {
    console.log("Donwload process starts here ");
    var adpresponse =[];
       const x = await boxObject.getFileIds(input);
       const y = await startIteration(x.entries,adpresponse); 
      return adpresponse;           
}


const startIteration = async(array,adpresponse)=>{
    
    for(var num of array){
      const a = await boxObject.downloadFile(num);
      var c = await adpService.invokeADP(a,num);
        qService.publishToQueue(c,num);
      if(JSON.parse(c).status.code == 202){
         await boxObject.moveFileIds(num);
        
      }
      adpresponse.push(c);
    }    
  } ;