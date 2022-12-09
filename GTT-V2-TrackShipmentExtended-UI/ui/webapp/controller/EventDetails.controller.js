sap.ui.define(
  [
    "./BaseDetailController",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    BaseDetailController,
    JSONModel
  ) {
    "use strict";

    return BaseDetailController.extend("com.sap.gtt.app.iot.sst.controller.EventDetails", {
      routeName: "eventDetails",

      routePatternMatched: function (oEvent) {
        var that = this;
        var args = oEvent.getParameter("arguments");
        // var odataModel = this.getModel();
        var sUrl = sap.ui.require.toUrl("com/sap/gtt/app/iot/sst/shipmentLogTest/api/v1/iot/shipment/events");
        jQuery.ajax({
          url: sUrl,
          type: "GET",
          success: function (oData) {
            var getTime;
            var timeStamp = new Date(args.timeStamp).getTime().toString();
            timeStamp = timeStamp.substring(0, timeStamp.length - 3);
            for (var i = 0; i < oData.length; i++) {
              var bussinessTime = new Date(oData[i].lbn_payload.actualBusinessTimestamp).getTime().toString();
              bussinessTime = bussinessTime.substring(0, bussinessTime.length - 3);
              if (timeStamp === bussinessTime) {
                getTime = oData[i].lbn_payload.actualBusinessTimestamp;
              }
            }
            that.getEventDetailsData(getTime, args.id);
          },
        });
      },

      getEventDetailsData: function (timeStamp,id) {
        var that = this;
        var sUrl = sap.ui.require.toUrl("com/sap/gtt/app/iot/sst/shipmentLogTest/api/v1/iot/shipment/" + id + "/events/" + timeStamp + "/processFlow");
        jQuery.ajax({
          url: sUrl,
          type: "GET",
          async: false,
          success: function (oData) {
            that.getView().setModel(new JSONModel({responseText: JSON.stringify(JSON.parse(oData.event.push[0].lbn_payload.eventReasonText), undefined, 4)}));
          },
        });
      },
    });
  }
);
