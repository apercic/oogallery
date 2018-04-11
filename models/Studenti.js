var mongoose = require('mongoose');

var StudentSchema = new mongoose.Schema({
	vpisnaSt: { type: Number, index: { unique: true }},
	ime: String,
	priimek: String,
	stalniNaslov: String,
	postaNaslov: String,
	telefon: Number,
	email: String
});

mongoose.model('Student', StudentSchema);

