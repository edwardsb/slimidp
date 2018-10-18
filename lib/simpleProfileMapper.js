function SimpleProfileMapper (pu) {
	if(!(this instanceof SimpleProfileMapper)) {
		return new SimpleProfileMapper(pu);
	}
	this._pu = pu;
}

SimpleProfileMapper.prototype.getClaims = function() {
	var self = this;
	var claims = {};

	SimpleProfileMapper.prototype.metadata.forEach(function(entry) {
		claims[entry.id] = entry.multiValue ?
			self._pu[entry.id].split(',') :
			self._pu[entry.id];
	});

	return claims;
};

SimpleProfileMapper.prototype.getNameIdentifier = function() {
	return {
		nameIdentifier:                  this._pu.email,
		nameIdentifierFormat:            'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
		// nameIdentifierNameQualifier:     this._pu.nameIdNameQualifier,
		// nameIdentifierSPNameQualifier:   this._pu.nameIdSPNameQualifier,
		// nameIdentifierSPProvidedID:      this._pu.nameIdSPProvidedID
	};
};


SimpleProfileMapper.prototype.metadata = [ {
	id: "display_name",
	optional: true,
	displayName: 'Display Name',
	description: 'The display name of the user',
	multiValue: false
}, {
	id: "email",
	optional: false,
	displayName: 'E-Mail Address',
	description: 'The e-mail address of the user',
	multiValue: false
}, {
	id: "role",
	optional: true,
	displayName: "Role",
	description: "The role you want the user to assume",
	options: ['SuperAdmin', 'Admin', 'ReadOnly']

}, {
	id: "master_id",
	optional: false,
	displayName: "Master Account ID",
	description: "The Account ID of the Master MSP Nebula Account",
	multiValue: false
},  {
	id: "site_id",
	optional: false,
	displayName: "Site Account ID",
	description: "The Account ID of the Site Nebula Account you want to log into",
	multiValue: false
}];

module.exports = SimpleProfileMapper;