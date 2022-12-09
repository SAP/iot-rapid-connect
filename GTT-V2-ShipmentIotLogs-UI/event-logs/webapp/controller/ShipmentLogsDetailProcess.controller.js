sap.ui.define([
  "eventlogs/controller/BaseController",
  'sap/ui/core/Fragment',
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  "eventlogs/model/formatter"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Fragment, JSONModel, MessageBox, Filter, FilterOperator, formatter) {
    "use strict";

    return Controller.extend("eventlogs.controller.ShipmentLogsDetailProcess", {
      formatter: formatter,

      //excute when the page first loads
      onInit: function () {
        this.getRouter().getRoute("TargetLogsDetailProcess").attachPatternMatched(this.loadEventLogsDetail, this);
      },

      //excute when the lbn detial page is loaded, call backend to get the latest detail data.
      loadEventLogsDetail: function (oEvent) {
        var oView = this.getView();
        var requestId = oEvent.getParameter("arguments").id,
          reportedAt = oEvent.getParameter("arguments").date;
        var sUrl = sap.ui.require.toUrl("eventlogs" + "/shipmentLogTest/api/v1/iot/shipment/" + requestId + "/events/" + reportedAt + "/processFlow");
        jQuery.ajax({
          url: sUrl,
          type: "GET",
          async: false,
          success: function (oData) {
            var eventBody = oData.event.push[0];
            var lbnResponse = oData.lbn_response.push[0];
            var oDetail = {};
            oDetail.requestId = lbnResponse.shipment_no;
            oDetail.reportedAt = new Date(lbnResponse.reported_at);
            oDetail.responseAt = new Date(lbnResponse.response_at);
            oDetail.status = lbnResponse.status;
            oDetail.payload = JSON.stringify(eventBody.lbn_payload, undefined, 4);
            if (lbnResponse.status == "Success") {
              oDetail.responseData = "Event Received Successfully";
            } else  {
              oDetail.responseData = JSON.stringify(lbnResponse.error_body.error, undefined, 4);
            }
            oView.setModel(new JSONModel(oDetail), "detailModel");
          }
        });
      },

      /*
        For the backend is not finished yet, so it's mock for now.
      */
      onRetrigger: function () {
        var oView = this.getView(),
          requestId = oView.getModel("detailModel").getProperty("/requestId");
        MessageBox.confirm("Retrigger with shipment id " + requestId + "?");
      }
    });

  });



