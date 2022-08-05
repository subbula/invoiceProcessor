var boxservice = require('../service/boxservice');

class routes {
  constructor(app){
      this.app = app;
  }
  init =()=>{
    this.app.get('/',(req,res)=>{
      res.send("ok")
    })
    this.app.get('/download/boxfile',async(req,res)=>{
   const z = await boxservice.downloadFileFrmBox(req);
    res.send(z);
    })
  }
  
}

module.exports =routes;