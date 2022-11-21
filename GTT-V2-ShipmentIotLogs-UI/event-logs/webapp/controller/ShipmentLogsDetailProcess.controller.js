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
      onInit: function () {
        this.getRouter().getRoute("RouteLogsDetailProcess").attachPatternMatched(this.loadEventLogsDetail, this);
      },

      loadEventLogsDetail: function (oEvent) {
        var oView = this.getView();
        var requestId = oEvent.getParameter("arguments").id,
          reportedAt = oEvent.getParameter("arguments").date;
        jQuery.ajax({
          url: "/shipmentLogTest/api/v1/iot/shipment/" + requestId + "/events/" + reportedAt + "/processFlow",
          type: "GET",
          async: false,
          success: function (oData) {
            var lbnResponse = oData.lbn_response.push[0];
            var oDetail = {};
            oDetail.requestId = lbnResponse.shipment_no;
            oDetail.reportedAt = new Date(lbnResponse.reported_at);
            oDetail.responseAt = new Date(lbnResponse.response_at);
            oDetail.status = lbnResponse.status;
            oDetail.payload = JSON.stringify(lbnResponse.error_body.error, undefined, 4);
            oView.setModel(new JSONModel(oDetail), "detailModel");
          }
        });
      },
      onRetrigger: function () {
        var oView = this.getView(),
          requestId = oView.getModel("detailModel").getProperty("/requestId");
        MessageBox.confirm("Retrigger with shipment id " + requestId + "?");
      }
    });

  });



