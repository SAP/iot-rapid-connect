sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
], function (Controller, History, UIComponent, JSONModel) {
	"use strict";

	return Controller.extend("eventlogs.controller.BaseController", {

		onInit: function () {
		},

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		//Go back to former page or go back to logs list page.
		onNavBack: function () {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
				console.log("s");
			} else {
				this.getRouter().navTo("RouteMain", {}, true /*no history*/);
			}
		}
	});
});
