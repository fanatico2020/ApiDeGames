const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "0fUFjpFv"

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function auth(req, res,next) {
const authToken = req.headers['authorization'];
if(authToken != undefined){
const bearer = authToken.split(' ');
var token = bearer[1];
jwt.verify(token,JWTSecret,(error,data) => {
  if(error){
    res.status(401);
    res.json({error:"Token invalido"});
  }else{
    req.token = token;
    req.loggedUser = {id:data.id,email:data.email};
    next(); 
  }
})
}else{
  res.status(401);
  res.json({error:"Token invalido"});
}

}

var DB = {
  games: [
    {
      id: 23,
      title: "Call of duty WM",
      year: 2019,
      price: 60,
    },
    {
      id: 65,
      title: "Sea of Thieves",
      year: 2018,
      price: 40,
    },
    {
      id: 2,
      title: "Minecraft",
      year: 2012,
      price: 20,
    }
  ],
  users:[
    {
      id:1,
      name:"Italo Ramon",
      email:"italo.ramon2020@gmail.com",
      password:"123456"
    },
    {
      id:10,
      name:"Guilherme",
      email:"gui2020@gmail.com",
      password:"654321"
    }
  ]
};



app.get("/games",auth,(req, res) => {
  res.status(200);
  res.json(DB.games);
});

app.get("/game/:id",auth,(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if(game != undefined){
            
            res.json(game);
            res.sendStatus(200);
        }else{
            res.sendStatus(404);
        }
    }

});

app.post("/game",auth,(req, res) => {
  var {title,price,year} = req.body;

  DB.games.push({
    id:2252,
    title,
    price,
    year
  });
  res.sendStatus(200);
})


app.delete("/game/:id",auth ,(req, res) => {
  if(isNaN(req.params.id)){
    res.sendStatus(400);
}else{
    var id = parseInt(req.params.id);
    var index = DB.games.findIndex(g => g.id == id);
    if(index == -1){
      res.sendStatus(404);
    }else{
      DB.games.splice(index,1);
      res.sendStatus(200);
    }
}
});

app.put("/game/:id",auth ,(req, res) => {
  if(isNaN(req.params.id)){
    res.sendStatus(400);
}else{
    var id = parseInt(req.params.id);
    var game = DB.games.find(g => g.id == id);
    if(game != undefined)
    {
      var {title,price,year} = req.body;
      if(title != undefined){
        game.title = title;
      }
      if(price != undefined){
        game.price = price;
      }
      if(year != undefined){
        game.year = year;
      }
      res.sendStatus(200);
    }else
    {
      res.sendStatus(404);
    }
  }
});

app.post("/auth",(req, res) =>{
  var {email,password} = req.body;

  if(email != undefined){
    var user = DB.users.find(user => user.email == email);
    if(user != undefined){
      if(user.password == password){
        jwt.sign({id:user.id,email:user.email},JWTSecret,{expiresIn:'24h'},(error,token)=> {
          if(error){
            res.status(400);
            res.json({eror:"Falha interna"})
          }else{
            res.status(200);
            res.json({token:token});
          }
        })
        
      }else{
        res.status(401);
        res.json({error:"Credenciais inválidas!"});
      }
    }else{
      res.status(404);
      res.json({error:"O E-mail enviado não existe na base de dados!"})
    }
  }else{
    res.status(400);
    res.json({error:"O E-mail enviado invalido!"})
  }
  });

app.listen(4000, () => {
  console.log("Api online");
});
