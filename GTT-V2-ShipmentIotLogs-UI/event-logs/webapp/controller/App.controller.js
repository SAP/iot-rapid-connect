sap.ui.define([
    "eventlogs/controller/BaseController",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("eventlogs.controller.App", {
            onInit: function () {
            }
        });
    });
