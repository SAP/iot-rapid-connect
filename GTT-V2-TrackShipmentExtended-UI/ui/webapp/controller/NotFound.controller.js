sap.ui.define(
  [
    "./BaseController",
  ], function (
    BaseController
  ) {
    "use strict";

    var controllerClassInfo = {
      onLinkPressed: function () {
        this.getRouter().navTo("shipmentList");
      },
    };

    return BaseController.extend(
      "com.sap.gtt.app.iot.sst.controller.NotFound",
      controllerClassInfo
    );
  }
);
