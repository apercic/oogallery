var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var fs = require('fs');
var multer = require('multer'),
bodyParser = require('body-parser'),
path = require('path');


var FileSaver = require('file-saver');



var uploading = multer({
  dest: '/home/aliize/Desktop/OOgalerija/studis11/',
  limits: {fileSize: 1000000, files:1},
})

var schema = new mongoose.Schema({ src: 'string', type: 'string'});
var Slika = mongoose.model('Slika', schema);


router.post('/profile', uploading.single('upl'), function(req,res){
	console.log("hadsfajhajs");
	
	/*console.log(req.file); //form files
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 } //*/
	 
	res.send("bebe");
});


router.get('/register/:username/:password', function(req, res) {
	var user = new User({username:req.params.username});
	user.setPassword(req.params.password);

	user.save(function(err){
		if (err) throw err;
		res.send({token: user.generateJWT()})
	});
});

router.post('/prijava/preveriPrijavo', function(req, res, next){
	req.body.username = req.body.elektronska_posta;
	req.body.password = req.body.geslo;

  passport.authenticate('local', function(err, user, info){
    if(err) throw err;

    if(user) res.send({status: "200", token: user.generateJWT()});
	else res.send({status:"401", vzrok: info});
  })(req, res, next);
});


//dobi vse slike
router.get('/slike', function(req, res) {
	Slika.find(function(err, slike) {
		if (err) throw err;
		res.send(slike);
	});
});

//shrani sliko
router.get('/slike/:ime', function(req, res) {
	var slikica = new Slika({ime:req.params.ime});
	slikica.save(function(err){
		if (err) res.send("napaka pri shranjevanju slike");
		else res.send("shranjeno");
	})
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
