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


var uploading = multer({dest: './public/'});
var schema_galerija = new mongoose.Schema({ ime:'string', vseSlike: ['string'], vsiOpisi: ['string']});
var Galerija = mongoose.model('Galerija', schema_galerija);


router.get('/vse_galerije', function(req, res) {
	Galerija.find(function(err, galerije) {
		if (err) throw err;
		res.send(galerije);
	});
});

router.get('/nova_galerija/:ime', function(req, res) {
	Galerija.findOne({'ime':req.params.ime}, function(err, ze_obstojeca) {
		if (err) throw err;
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

router.get('/zbrisi_galerija/:ime', function(req, res) {
	Galerija.remove({'ime':req.params.ime}, function(err) {
		if (err) throw err;
		res.send("uspešno zbrisana galerija");
	});
});

router.get('/vse_slike_iz_galerije/:galerija', function(req, res) {
	Galerija.findOne({'ime':req.params.galerija}, function(err, galerija) {
		if (err) throw err;
		if (galerija == null) {
			console.log("ta galerija ne obstaja");
			return [];
		}
		res.send(galerija);
	});
});

router.post('/shrani_sliko_v_galerijo/:galerija/:opis', uploading.single('upl'), function(req, res) {
	Galerija.findOneAndUpdate({ime:req.params.galerija}, {$push:{vseSlike: req.file.filename, vsiOpisi: req.params.opis}}, 
		function(err, galerija) {
		if (err) res.send("napaka");		
		res.redirect('/#!/galerija/'+req.params.galerija);
	});
});

router.get('/zbrisi_sliko/:galerija_ime/:slika_ime/:opis', function(req, res) {
	Galerija.findOneAndUpdate({ime:req.params.galerija_ime}, {$pull:{vseSlike:req.params.slika_ime, vsiOpisi:req.params.opis}}, 
		function(err, galerija) {
		if (err) res.send("napaka");		
		res.redirect('/#!/galerija/'+req.params.galerija_ime);
	});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
