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
  dest: './public/',
  //limits: {fileSize: 1000000, files:1}
})

var schema = new mongoose.Schema({ src:'string', type:'string'});
var Slika = mongoose.model('Slika', schema);

//galerija hrani json-e slik
var schema_galerija = new mongoose.Schema({ ime:'string', vseSlike: ['string']});
var Galerija = mongoose.model('Galerija', schema_galerija);
//var Student = mongoose.model('Student');
var User = mongoose.model('User');


//dobi vse galerije
router.get('/vse_galerije', function(req, res) {
	Galerija.find(function(err, galerije) {
		if (err) throw err;
		res.send(galerije);
	});
});
//ustvari novo galerijo
//preverjaj da ni istega imena že v bazi
router.get('/nova_galerija/:ime', function(req, res) {
	//preverimo da galerija s tem imenom še ne obstaja
	Galerija.findOne({'ime':req.params.ime}, function(err, ze_obstojeca) {
		if (err) throw err;
		console.log(ze_obstojeca);
		//če že obstaja z istim imenom, ne ustvarimo še ene
		if (ze_obstojeca != null) {
			res.send("Galerija s tem imenom že obstaja");
		}
		else {
			var gale = new Galerija({ime:req.params.ime});
			gale.save(function(err){
				if (err) res.send("napaka pri ustvarjanju galerije");
				Galerija.find(function(err, galerije) {
					if (err) res.send("napaka pri ustvarjanju galerije");
					res.send(galerije);
				});
			})
		}
	});

	
});

//zbriše galerijo
router.get('/zbrisi_galerija/:ime', function(req, res) {
	Galerija.remove({'ime':req.params.ime}, function(err) {
		if (err) throw err;
		res.send("uspešno zbrisana galerija");
	});
});


//dobi vse slike iz določene galerije
router.get('/vse_slike_iz_galerije/:galerija', function(req, res) {
	Galerija.findOne({'ime':req.params.galerija}, function(err, galerija) {
		if (err) throw err;
		if (galerija == null) {
			console.log("ta galerija ne obstaja");
			return [];
		}
		res.send(galerija.vseSlike);
	});
});

//shrani sliko v določeno galerijo
//preveri da galerija sploh obstaja
router.post('/shrani_sliko_v_galerijo/:galerija', uploading.single('upl'), function(req, res) {
	Galerija.findOneAndUpdate({ime:req.params.galerija}, {$push:{vseSlike: req.file.filename}}, 
		function(err, galerija) {
		if (err) res.send("napaka");		
		res.redirect('/#!/galerija/'+req.params.galerija);
	});
});


//zbriše sliko iz galerije......
router.get('/zbrisi_sliko/:galerija_ime/:slika_ime', function(req, res) {
	Galerija.findOneAndUpdate({ime:req.params.galerija_ime}, {$pull:{vseSlike: req.params.slika_ime}}, 
		function(err, galerija) {
		if (err) res.send("napaka");		
		res.redirect('/#!/galerija/'+req.params.galerija_ime);
	});
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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
