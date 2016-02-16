var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var users =[
  {
    "_id": "55aa5841fe158992610cad7d",
    "name": "Ayers Rollins",
    "email": "ayersrollins@isotrack.com"
  },
  {
    "_id": "55aa584126ac276d8bece95c",
    "name": "Romero Woodard",
    "email": "romerowoodard@isotrack.com"
  },
  {
    "_id": "55aa584138adab4db0d04039",
    "name": "Craft Raymond",
    "email": "craftraymond@isotrack.com"
  },
  {
    "_id": "55aa58417c311526c20508c9",
    "name": "Case Rodriguez",
    "email": "caserodriguez@isotrack.com"
  },
  {
    "_id": "55aa584170eae42149078fbf",
    "name": "Madge Mooney",
    "email": "madgemooney@isotrack.com"
  },
  {
    "_id": "55aa5841376ce6ed4d601735",
    "name": "Burt Curry",
    "email": "burtcurry@isotrack.com"
  },
  {
    "_id": "55aa5841fad7e9f6119f0deb",
    "name": "Leslie Walsh",
    "email": "lesliewalsh@isotrack.com"
  },
  {
    "_id": "55aa5841ce60fdfafd2587f6",
    "name": "Kennedy Randall",
    "email": "kennedyrandall@isotrack.com"
  },
  {
    "_id": "55aa5841c4a420bf52c50efb",
    "name": "Powell Norton",
    "email": "powellnorton@isotrack.com"
  }
];

res.send({status:200,users:users});

});

module.exports = router;
