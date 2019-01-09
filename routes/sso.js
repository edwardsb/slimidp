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
const assertionConsumerServiceURL = process.env.ACSURL || 'http://cloud.malwarebytes.localhost/sso/acs/5f111e49-3d12-431a-8749-8ad1d3929ea3'; //default local environment

/* GET users listing. */
router.post('/', function (req, res) {

	req.user = req.body;

	const authOptions = {
		issuer: 'oneview',
		cert: fs.readFileSync(path.join(__dirname, '../signing-cert-pub.pem')), // we will need to share this certificate
		key: fs.readFileSync(path.join(__dirname, '../signing-cert-pvt.key')),
		getPostURL: function (wtrealm, wreply, req, callback) {
			return callback(null, assertionConsumerServiceURL)
		},
		profileMapper: SimpleProfileMapper
	};

	// handle
	if (req.user._authnRequest) {
		req.authnRequest = JSON.parse(req.user._authnRequest);

		// Apply AuthnRequest Params
		authOptions.inResponseTo = req.authnRequest.id;
		authOptions.acsUrl = req.authnRequest.acsUrl;
		authOptions.recipient = req.authnRequest.acsUrl;
		authOptions.destination = req.authnRequest.acsUrl;
		authOptions.forceAuthn = req.authnRequest.forceAuthn;
		if (req.authnRequest.relayState) {
			authOptions.RelayState = req.authnRequest.relayState;
		}

		authOptions.getPostURL = function (wtrealm, wreply, req, callback) {
			return callback(null, req.authnRequest.acsUrl)
		}
	}

	// do the sso things
	samlp.auth(authOptions)(req, res)
});

const processServiceProviderInitiated = function (req, res) {
	samlp.parseRequest(req, function (err, data) {
		if (err) {
			return res.render('error', {
				message: 'SAML AuthnRequest Parse Error: ' + err.message,
				error: err
			})
		}
		if (data) {
			req.authnRequest = {
				relayState: req.query.RelayState || req.body.RelayState,
				id: data.id,
				issuer: data.issuer,
				destination: data.destination,
				acsUrl: data.assertionConsumerServiceURL,
				forceAuthn: data.forceAuthn === 'true'
			};
			console.log('Received AuthnRequest => \n', req.authnRequest);

			res.render('user', {
				title: "Solicited Login",
				authnRequest: req.authnRequest
			})

		}
	})
};

router.get('/login', processServiceProviderInitiated);
router.post('/login', processServiceProviderInitiated);

module.exports = router;
