var boxservice = require('../service/boxservice');
var actionObj  = require('../actions/action');

class routes {
  constructor(app){
      this.app = app;
  }
  init =()=>{
    this.app.get('/',(req,res)=>{
      res.send("ok")
    })
    this.app.get('/download/boxfile',async(req,res)=>{
      const z = await actionObj.gettingResponse(req.query);
      res.send(z);
      const y = await actionObj.downloadFileFrmBox(z.data,req.query);
    })
  }
  
}

module.exports =routes;