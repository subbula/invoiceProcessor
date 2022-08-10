var amqp = require('amqplib/callback_api');
var adpService = require('./adpservice');
const axios = require('axios').default;
var https = require("https");
var request = require('request');

// const CONN_URL = "amqp://default_user_9uxk1dNldCy4Jc3bDZJ:VrGXM95Yvyt9IcYQrtGy2-_AlBJB9hYQ@localhost:5671";
const CONN_URL = "amqp://default_user_9uxk1dNldCy4Jc3bDZJ:VrGXM95Yvyt9IcYQrtGy2-_AlBJB9hYQ@dev-deploy-rabbitmq.dw-cp4ba.svc.cluster.local:5672";
// const CONN_URL = "amqp://default_user_7QaEQ8QmNh7yCe-413V:TEON9bWtrXKpdpn8a8y0LPfzc4g1m_F0@rabbitmq-dev-deploy-server-0.dw-cp4ba.svc.cluster.local:5672";

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

exports.publishToQueue = async (adpRes,fileId) => {
        var ADPanalayzerId = JSON.parse(adpRes).result[0].data.analyzerId;
        var msg = {
            'fileId':fileId.id,
            'analayzerId':ADPanalayzerId,
            'fileName':fileId.name
        }
		return ch.sendToQueue(process.env.queueName,  Buffer.from(JSON.stringify(msg)),{persistent: true});
 }


 var agent = new https.Agent({
    rejectUnauthorized: false
 }); 


const getADPAccessToken = async () =>{

    const authtoken = await axios.get(process.env.adpUrl +'/v1/preauth/validateAuth',{httpsAgent:agent, headers:{"Authorization":"Basic " +process.env.adpBasicToken}})

    return authtoken.data.accessToken;
    

}

const getWorkFlowAccesstoken = async () =>{
 
	var data = { "refresh_groups": true, "requested_lifetime": 7200 };

    const authtoken = await axios.post(process.env.cloudpakUrl +'/bas/bpm/system/login',data,{ httpsAgent:agent,headers:{"Authorization":"Basic Y3A0YWRtaW46ZEFJblhvcm51OTRIVHZidmo5b2k="}})

    return authtoken.data.csrf_token;
    

}



exports.consumerProcess = async()=>{
	var agent = new https.Agent({
		rejectUnauthorized: false
	});
    var adpJsonRes ;
    var workflowToken = await getWorkFlowAccesstoken();
	var token = await getADPAccessToken();
    return new Promise((resolve,reject)=>{
	ch.consume(process.env.queueName, function (msg) {
		var processIdRaw =msg.content.toString();
    	var processIdObj = JSON.parse(processIdRaw);
		console.log('.....',processIdObj);
		var url = process.env.adpUrl +"/adp/aca/v1/projects/"+process.env.adpProjectId+"/analyzers/"+processIdObj.analayzerId+"/json";
     axios.get(url,{httpsAgent:agent, headers:{"Authorization":"Bearer " +token}})
       .then((adpJsonRes)=>{
        console.log(adpJsonRes,"adpJsonRes")
       if(adpJsonRes.data.result[0].data.KeyClassRankedList.length > 0) {
		ch.ack(msg);
         console.log(adpJsonRes.data.result[0].data.KeyClassRankedList,"adpJsonRes");
          
            var APDObj = adpJsonRes.data.result[0].data.KeyClassRankedList;
            const vendorEmailObj = APDObj.filter((one)=>{
                return one.KeyClassName == 'Vendor email'});
            var vendorEmail = vendorEmailObj[0].KVPRankedList[0].Reserved1 ? vendorEmailObj[0].KVPRankedList[0].Reserved1 :null;  
    
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
    
            console.log(adsObj,"adsObj");
            let d={
                "input": [
                {
                    "name": "ADPJson",
                    "data": adsObj
                }
                ]
              };
    
        axios.post(process.env.cloudpakUrl +'/bas/bpm/processes?model=Invoice-Processor&container=IP',d,{ httpsAgent:agent,headers:{"Authorization":"Basic Y3A0YWRtaW46ZEFJblhvcm51OTRIVHZidmo5b2k=","BPMCSRFToken":workflowToken}},(finalRes)=>{
        resolve(finalRes);
        })    
            }
        else{
            
              ch.nack(msg);
              resolve('nack');
          

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




