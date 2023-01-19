var amqp = require('amqplib/callback_api');
var express = require('express');
var app = express();
const CONN_URL = "amqp://default_user_GDFEtJnxWPCWR26MaVd:_Vnq2KDhelk9zQ6cGZH1nomfjYQcKvu2@localhost:5671";
let ch = null;
var queueName = invoice_processor_queue;
amqp.connect(CONN_URL, function (err, conn) {
	if (err) {
		console.log("=========Error in queue connection==");
		console.log(err);
        throw(err);
	}
   conn.createChannel(function (err, channel) {
      ch = channel;
	  ch.assertQueue(queueName,{durable:true});
	  
   });
    });
app.get('/publish', (req, res) => {
    
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
    res.send('Ok')
})

app.get('/consume', (req, res) => {
    ch.get(queueName, (err, Q) => {
        console.log(Q, 'QQQ');
    })
    res.send('Ok')
});

app.listen(3300);
