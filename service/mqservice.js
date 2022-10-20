var amqp = require('amqplib/callback_api');
var adpService = require('./adpservice');
const axios = require('axios').default;
var https = require("https");
var request = require('request');

// const CONN_URL = "amqp://default_user_I8FSUhEDFrRZPtfE175:YwUB4xQXqJuScwHCJNi6n2Ff5bILW_Y8@localhost:5671";
// const CONN_URL = "amqp://default_user_9uxk1dNldCy4Jc3bDZJ:VrGXM95Yvyt9IcYQrtGy2-_AlBJB9hYQ@dev-deploy-rabbitmq.dw-cp4ba.svc.cluster.local:5672";
const CONN_URL = "amqp://default_user_I8FSUhEDFrRZPtfE175:YwUB4xQXqJuScwHCJNi6n2Ff5bILW_Y8@rabbitmq-dev-deploy.dw-cp4ba.svc.cluster.local:5672";

var cloudpakurlfrmworkflow ="https://cpd-cp4ba.itzroks-2700075nbq-wuvqz1-4b4a324f027aea19c5cbc0c3275c4656-0000.eu-de.containers.appdomain.cloud";
var cloudpakurlfrmworkflowtoken = "Y3A0YWRtaW46YURPM2NrekxhdDNjQlFOTVBIQW8=";
let ch = null;
amqp.connect(CONN_URL, function (err, conn) {
	if (err) {
		console.log("=========Error in queue connection==");
		console.log(err);
        throw(err);
	}
   conn.createChannel(function (err, channel) {
      ch = channel;
	  ch.assertQueue(process.env.queueName,{durable:true});
	  
   });
});

exports.publishToQueue = async (adpRes,fileId,dbdata,input) => {
        var ADPanalayzerId = JSON.parse(adpRes).result[0].data.analyzerId;
        var workflowToken = await getWorkFlowAccesstoken(input);
        var msg = {
            'fileId':fileId.id,
            'analayzerId':ADPanalayzerId,
            'fileName':fileId.name,
             "executionid":dbdata.executionid,
             "user_id":input.userId,
             "cloudpakurl":input.cloudpakurl,
             "cloudpakurltoken":input.cloudpakurltoken,
             "workflowToken":workflowToken
        }
       
        console.log("msg while publish into Q",msg);
		return ch.sendToQueue(process.env.queueName,  Buffer.from(JSON.stringify(msg)),{persistent: true});
 }


 var agent = new https.Agent({
    rejectUnauthorized: false
 }); 


const getADPAccessToken = async () =>{

    const authtoken = await axios.get(process.env.adpUrl +'/v1/preauth/validateAuth',{httpsAgent:agent, headers:{"Authorization":"Basic " +process.env.adpBasicToken}})

    return authtoken.data.accessToken;
    

}

const getWorkFlowAccesstoken = async (msg) =>{
 
	var data = { "refresh_groups": true, "requested_lifetime": 7200 };

    const authtoken = await axios.post(msg.cloudpakurl +'/bas/bpm/system/login',data,{ httpsAgent:agent,headers:{"Authorization":"Basic "+msg.cloudpakurltoken}})

    return authtoken.data.csrf_token;
    

}



exports.consumerProcess = async()=>{
	var agent = new https.Agent({
		rejectUnauthorized: false
	});
    var adpJsonRes ;
    // var workflowToken = await getWorkFlowAccesstoken();
	var token = await getADPAccessToken();
    return new Promise((resolve,reject)=>{
	ch.consume(process.env.queueName, function (msg) {
		var processIdRaw =msg.content.toString();
    	var processIdObj = JSON.parse(processIdRaw);
		console.log('.....Consumed message from Q....',processIdObj);
    //  getWorkFlowAccesstoken(processIdObj)
    //  .then((workflowToken)=>{
        var url = process.env.adpUrl +"/adp/aca/v1/projects/"+process.env.adpProjectId+"/analyzers/"+processIdObj.analayzerId+"/json";
     axios.get(url,{httpsAgent:agent, headers:{"Authorization":"Bearer " +token}})
       .then((adpJsonRes)=>{
        // console.log(adpJsonRes,"adpJsonRes")
       if(adpJsonRes.data.result[0].data.KeyClassRankedList.length > 0) {
		ch.ack(msg);
        //  console.log(adpJsonRes.data.result[0].data.KeyClassRankedList,"adpJsonRes inside If");

         const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          
            var APDObj = adpJsonRes.data.result[0].data.KeyClassRankedList;
            const vendorEmailObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Vendor email'});
            var vendorEmailString = vendorEmailObj[0].KVPRankedList[0].Reserved1 ? (vendorEmailObj[0].KVPRankedList[0].Reserved1 ):null;  
            
           var validatingEmail = vendorEmailString ? emailRegexp.test(vendorEmailString) : true;
           var vendorEmail = (validatingEmail) ? vendorEmailObj[0].KVPRankedList[0].Reserved1: (vendorEmailObj[0].KVPRankedList[1].Reserved1? vendorEmailObj[0].KVPRankedList[1].Reserved1:"");
            const VendorNameObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Vendor name'});
            var vendorName = VendorNameObj[0].KVPRankedList[0].Reserved1 ? VendorNameObj[0].KVPRankedList[0].Reserved1 :null;  
    
            const VendorPhoneObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Vendor phone number'});
            var vendorPhone= VendorPhoneObj[0].KVPRankedList[0].Reserved1 ? VendorPhoneObj[0].KVPRankedList[0].Reserved1 :null;   
    
            const InvoiceDateObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Invoice date'});
            var InvoiceDate= InvoiceDateObj[0].KVPRankedList[0].Reserved1 ? InvoiceDateObj[0].KVPRankedList[0].Reserved1 :null;  
    
            const InvoiceNumberObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Invoice number'});
            var InvoiceNumber= InvoiceNumberObj[0].KVPRankedList[0].Reserved1 ? InvoiceNumberObj[0].KVPRankedList[0].Reserved1 : null;   
    
            const InvoiceTotalObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Invoice total'});
            var InvoiceTotal= InvoiceTotalObj[0].KVPRankedList[0].Reserved1 ? InvoiceTotalObj[0].KVPRankedList[0].Reserved1 :null;  
    
    
            let adsObj = {
                "vendorInformation":{},
                "invoiceDetail":{}
            };
    
            adsObj.vendorInformation['vendorEmail'] =vendorEmail;
            adsObj.vendorInformation['vendorName'] =vendorName;
            adsObj.vendorInformation['vendorPhoneNumber'] =vendorPhone;
            adsObj.invoiceDetail['invoiceDate'] =InvoiceDate;
            adsObj.invoiceDetail['invoiceNumber'] =InvoiceNumber;
            adsObj.invoiceDetail['invoiceTotal'] =InvoiceTotal;
            adsObj['today']=new Date().toISOString().slice(0,10);
            adsObj['fileId']=processIdObj.fileId;
            adsObj['fileName']=processIdObj.fileName;
            adsObj['executionid']=processIdObj.executionid;
            adsObj['user_id']=processIdObj.user_id;
    
            console.log(adsObj,"adsObj");
            let d={
                "input": [
                {
                    "name": "ADPJson",
                    "data": adsObj
                }
                ]
              };
    
        axios.post(processIdObj.cloudpakurl +'/bas/bpm/processes?model=Invoice-Processor&container=IP',d,{ httpsAgent:agent,headers:{"Authorization":"Basic "+processIdObj.cloudpakurltoken,"BPMCSRFToken":processIdObj.workflowToken}},(finalRes)=>{
        resolve(finalRes);
        })    
            }
        else{
            setTimeout(() => {
                console.log("Hello, World!");
                ch.nack(msg);
              resolve('nack');
            }, 50000)
              
        }    
        })
        .catch((err)=>{
            console.log(err,"err in consume processing")
            reject(err);
        })
     
		
		},{ noAck: false }
        
	  );
    })
} 

process.on('exit', (code) => {
	ch.close();
	console.log(`Closing rabbitmq channel`);
 });




