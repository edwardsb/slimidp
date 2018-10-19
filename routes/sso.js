const fs = require('fs');
const samlp = require('samlp');

const path = require('path');
const express = require('express');
const router = express.Router();

// passport profile mapper
const SimpleProfileMapper = require('../lib/simpleProfileMapper.js');

// this URL will be supplied for every environment
/*
 dev:   https://nebula-retina-mb-dev.eng-dev.mb-internal.com/sso/acs/{some id we have yet to determine}
 qa:    https://nebula-retina-mb-qa.eng-dev.mb-internal.com/sso/acs/{some id we have yet to determine}
 stage: https://nebula-retina-mb-stage.eng-prod.mb-internal.com/sso/acs/{some id we have yet to determine}
 prod:  https://cloud.malwarebytes.com/sso/acs/{some id we have yet to determine}
 */
const assertionConsumerServiceURL = process.env.ACSURL || 'http://cloud.malwarebytes.localhost/sso/acs/60d191ca-9fe8-4202-a24f-12341d7e9541'; //default local environment

/* GET users listing. */
router.post('/', function (req, res) {

	req.user = req.body;

	// do the sso things
	samlp.auth({
		issuer:     'msp',
		cert:       fs.readFileSync(path.join(__dirname, '../signing-cert-pub.pem')), // we will need to share this certificate
		key:        fs.readFileSync(path.join(__dirname, '../signing-cert-pvt.key')),
		getPostURL: function (wtrealm, wreply, req, callback) {
			return callback( null, assertionConsumerServiceURL)
		},
		profileMapper: SimpleProfileMapper
	})(req, res)
});

module.exports = router;
