/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"preco/caixa/sol/preco01/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});