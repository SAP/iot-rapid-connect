QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
  "use strict";

  sap.ui.require(
    [
      "com/sap/gtt/app/iot/sst/localService/mockserver",
      "com/sap/gtt/app/iot/sst/test/integration/ShipmentListJourney",
      "com/sap/gtt/app/iot/sst/test/integration/NavigationJourney",
      "com/sap/gtt/app/iot/sst/test/integration/NotFoundJourney",
    ],
    function (
      mockserver
    ) {
      // set up test service for local testing
      mockserver.init();

      QUnit.start();
    });
});
