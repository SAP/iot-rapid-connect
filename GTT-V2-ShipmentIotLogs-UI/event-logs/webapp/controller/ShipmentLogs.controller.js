sap.ui.define([
  "eventlogs/controller/BaseController",
  "eventlogs/model/formatter",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/ui/model/type/String'
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, formatter, JSONModel, MessageBox, Filter, FilterOperator, TypeString) {
    "use strict";
    return Controller.extend("eventlogs.controller.ShipmentLogs", {
      formatter: formatter,

      //excute when the page first loads
      onInit: function () {
        this._oSingleInputtrackingIDInputID = this.byId("trackingIDInputID");
        this._oSingleInputreportedByInputID = this.byId("reportedByInputID");
        this._oSingleInputretriggerCountInputID = this.byId("retriggerCountInputID");
        this.getRouter().getRoute("TargetLogs").attachPatternMatched(this.loadEventLogs, this);
      },

      //excute when the list page is loaded, call backend to get the latest list.
      loadEventLogs: async function () {
        var that = this;
        var oView = this.getView();

        //load mock data when develop in local
        // var oRequestModel = new JSONModel();
        // oRequestModel.loadData("../data/logsListMockData.json", false);
        // oView.setModel(oRequestModel, "requestModel");

        //get Data from backend.
        var sUrl = sap.ui.require.toUrl("eventlogs" + "/shipmentLogTest/api/v1/iot/shipment/events");
        jQuery.ajax({
          url: sUrl,
          type: "GET",
          success: function (oData) {
            var shipmentList = [];
            var shipment = {};
            for (var i = 0; i < oData.length; i++) {
              shipment = {};
              shipment.trackingId = oData[i].shipment_no;
              shipment.reportedBy = oData[i].event_body.reportedBy;
              shipment.retriggerCount = "0";
              shipment.status = oData[i].lbn_status;
              shipment.priority = oData[i].event_body.priority;
              shipment.reportedAt = new Date(oData[i].reported_at);
              shipment.updatedAt = new Date(oData[i].updated_at);
              shipment.reported_at = oData[i].reported_at;
              shipment.updated_at = oData[i].updated_at;
              shipmentList.push(shipment);
            }
            that.requestModel = new JSONModel({ shipmentList: shipmentList });
            oView.setModel(that.requestModel, "requestModel");
            oView.getModel("requestModel").setProperty("/retriggerEnabled", false);
            var oTableTitle = that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("logsTableTitle", shipmentList.length);
            oView.getModel("requestModel").setProperty("/oTableTitle", oTableTitle);
          },
          error: function (oError) {
            that.errorHandler(oError);
          }
        });
      },

      //Nav to detail page when click any list line.
      onNavToDetail: function (oEvent) {
        var requestId = oEvent.getSource().getAggregation("cells")[0].getText();
        var reportedAt = oEvent.getSource().getAggregation("cells")[2].getTooltip();
        this.oRouter = this.getRouter();
        this.oRouter.navTo("TargetLogsDetail", { id: requestId, date: reportedAt });
      },

      //search the list by the top search filter 
      onSearch: function () {
        var oFilters = [];
        var oValue;
        var oFiltersTrackingID = [],
          oFiltersReportedBy = [],
          oFiltersRetirggerCount = [],
          oFiltersReportedAt = [],
          oFiltersUpdatedAt = [],
          oFiltersPriority = [],
          oFilterStatus = [];
        var trackingIdFilter = this._oSingleInputtrackingIDInputID.getTokens(),
          reportedByFilter = this._oSingleInputreportedByInputID.getTokens(),
          retirggerCountFilter = this._oSingleInputretriggerCountInputID.getTokens(),
          reportedRange = this.byId("DRS2"),
          reportedFromDate = reportedRange.getDateValue(),
          reportedEndDate = reportedRange.getSecondDateValue(),
          updatedRange = this.byId("DRS3"),
          updatedFromDate = updatedRange.getDateValue(),
          updatedEndDate = updatedRange.getSecondDateValue();
        for (var iTrackingID = 0; iTrackingID < trackingIdFilter.length; iTrackingID++) {
          oValue = trackingIdFilter[iTrackingID].getAggregation("customData")[0].getProperty("value");
          oFiltersTrackingID.push(new Filter("trackingId", oValue.operation, oValue.value1, false));
        }
        for (var iReportedBy = 0; iReportedBy < reportedByFilter.length; iReportedBy++) {
          oValue = reportedByFilter[iReportedBy].getAggregation("customData")[0].getProperty("value");
          oFiltersReportedBy.push(new Filter("reportedBy", oValue.operation, oValue.value1, false));
        }
        for (var iCount = 0; iCount < retirggerCountFilter.length; iCount++) {
          oValue = retirggerCountFilter[iCount].getAggregation("customData")[0].getProperty("value");
          oFiltersRetirggerCount.push(new Filter("retriggerCount", oValue.operation, oValue.value1, false));
        }
        if (reportedEndDate && reportedFromDate) {
          oFiltersReportedAt.push(new Filter({
            path: "reportedAt",
            operator: FilterOperator.BT,
            value1: reportedFromDate,
            value2: reportedEndDate
          }));
        }
        if (updatedEndDate && updatedFromDate) {
          oFiltersUpdatedAt.push(new Filter({
            path: "updatedAt",
            operator: FilterOperator.BT,
            value1: updatedFromDate,
            value2: updatedEndDate
          }));
        }

        var oPriority = this.byId("prioritySelect").getSelectedItems();
        for (var iPriority = 0; iPriority < oPriority.length; iPriority++) {
          oFiltersPriority.push(new Filter("priority", FilterOperator.EQ, oPriority[iPriority].getText()));
        }
        var oStatus = this.byId("statusSelect").getSelectedItems();
        for (var iStatus = 0; iStatus < oStatus.length; iStatus++) {
          oFilterStatus.push(new Filter("status", FilterOperator.EQ, oStatus[iStatus].getText()));
        }
        oFiltersReportedBy.length == 0 ? "" : oFilters.push(new Filter(oFiltersReportedBy, true));
        oFiltersTrackingID.length == 0 ? "" : oFilters.push(new Filter(oFiltersTrackingID, true));
        oFiltersRetirggerCount.length == 0 ? "" : oFilters.push(new Filter(oFiltersRetirggerCount, true));
        oFiltersPriority.length == 0 ? "" : oFilters.push(new Filter(oFiltersPriority, false));
        oFilterStatus.length == 0 ? "" : oFilters.push(new Filter(oFilterStatus, false));
        oFiltersReportedAt.length == 0 ? "" : oFilters.push(new Filter(oFiltersReportedAt, true));
        oFiltersUpdatedAt.length == 0 ? "" : oFilters.push(new Filter(oFiltersUpdatedAt, true));
        var finalFilter = new Filter(oFilters, true);
        var oTable = this.byId("idShipmentListTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(finalFilter);
        var oTableTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("logsTableTitle", oTable.getItems().length == 0 ? "0" : oTable.getItems().length);
        this.getView().getModel("requestModel").setProperty("/oTableTitle", oTableTitle);
      },

      //open value help dialog
      onVHRequestedTrackingID: function () {
        this.getView().getModel("requestModel").setProperty("/inputID", "trackingIDInputID");
        this.getView().getModel("requestModel").setProperty("/valueHelpTitle", "Shipment ID");
        this.onMultiConditionVHRequested(this._oSingleInputtrackingIDInputID);
      },

      onVHRequestedReportedBy: function () {
        this.getView().getModel("requestModel").setProperty("/inputID", "reportedByInputID");
        this.getView().getModel("requestModel").setProperty("/valueHelpTitle", "Reported By");
        this.onMultiConditionVHRequested(this._oSingleInputreportedByInputID);
      },

      onVHRetriggerCount: function () {
        this.getView().getModel("requestModel").setProperty("/inputID", "retriggerCountInputID");
        this.getView().getModel("requestModel").setProperty("/valueHelpTitle", "Retrigger Count");
        this.onMultiConditionVHRequested(this._oSingleInputretriggerCountInputID);
      },

      onMultiConditionVHRequested: function (oSingleConditionMultiInput) {
        var oInputID = this.getView().getModel("requestModel").getProperty("/inputID");
        if (!this["pSingleDialog" + oInputID]) {
          this["pSingleDialog" + oInputID] = this.loadFragment({
            name: "eventlogs.fragment.ValueHelpDialogSingleConditionTab"
          });
        }
        this["pSingleDialog" + oInputID].then(function (oSingleConditionDialog) {
          if (this["_bSingleInitialized" + oInputID]) {
            oSingleConditionDialog.open();
            return;
          }
          this["_oSingleDialog" + oInputID] = oSingleConditionDialog;
          oSingleConditionDialog.setRangeKeyFields([{
            key: "id",
            type: "string",
            typeInstance: new TypeString({}, {
              maxLength: 20
            })
          }]);
          oSingleConditionDialog.setTokens(oSingleConditionMultiInput.getTokens());
          this["_bSingleInitialized" + oInputID] = true;
          oSingleConditionDialog.open();
        }.bind(this));
      },

      /*
      When close the value help dialog with ok button.
      Save the selected tokens.
      */
      onMultiConditionValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var inputID = this.getView().getModel("requestModel").getProperty("/inputID");
        this["_oSingleInput" + inputID].setTokens(aTokens);
        this["_oSingleDialog" + inputID].close();
      },

      /*
      When close the value help dialog with cancel button.
      Don't save the selected tokens.
      */
      onMultiConditionCancelPress: function () {
        var inputID = this.getView().getModel("requestModel").getProperty("/inputID");
        this["_oSingleDialog" + inputID].close();
      },

      /*
        Excute when call backend with error.
      */
      errorHandler: function (oError) {
        if (oError.message) {
          MessageBox.error(oError.message);
        }
      },

      /*
        When the seleted list lines have error, excute the retrigger funcion.
        But the backend for retrigger funcion is not finished yet.
        So here is just the mock.
      */
      onRetrigger: function () {
        var oTable = this.getView().byId("idShipmentListTable");
        var oItems = oTable.getSelectedItems();
        var cells = [];
        var errorLogs = [],
          noErroLogs = [];
        for (var i = 0; i < oItems.length; i++) {
          cells = oItems[i].getAggregation("cells");
          if (cells[6].getText() == "Failed" || cells[6].getText() == "Warning") {
            errorLogs.push(cells[0].getText());
          } else {
            noErroLogs.push(cells[0].getText());
          }
        }
        if (noErroLogs.length == 0) {
          var errorLogsString = "";
          for (var i = 0; i < errorLogs.length; i++) {
            if (i != errorLogs.length - 1) {
              errorLogsString += errorLogs[i] + ", ";
            } else {
              errorLogsString += errorLogs[i];
            }
          }
          MessageBox.confirm("Retrigger Log " + errorLogsString + "?");
        } else {
          var noErrorLogsString = "";
          for (var i = 0; i < noErroLogs.length; i++) {
            if (i != noErroLogs.length - 1) {
              noErrorLogsString += noErroLogs[i] + ", ";
            } else {
              noErrorLogsString += noErroLogs[i];
            }
          }
          MessageBox.warning("Log " + noErrorLogsString + " doesn't have error.");
        }
      },

      /*
        When user select any line, the retrigger button will be enabled.
      */
      onSelect: function (oEvent) {
        var oView = this.getView();
        var selectedItems = oEvent.getSource().getSelectedItems();
        if (selectedItems.length == 0) {
          oView.getModel("requestModel").setProperty("/retriggerEnabled", false);
        } else {
          oView.getModel("requestModel").setProperty("/retriggerEnabled", true);
        }
      },

      dateFormat: function (dateTime) {
        var o = this.dateFormatUtil(dateTime);
        var fmt = o.y + "-" + o.M + "-" + o.d;
        return fmt;
      },

      dateFormatUtil: function (dateTime) {
        var o = {
          "y": dateTime.getFullYear(),
          "M": dateTime.getMonth() + 1,
          "d": dateTime.getDate(),
          "h": dateTime.getHours(),
          "m": dateTime.getMinutes()
        };
        if (o.m < 10) {
          o.m = "0" + o.m;
        }
        if (o.M < 10) {
          o.M = "0" + o.M;
        }
        if (o.d < 10) {
          o.d = "0" + o.d;
        }
        if (o.h < 10) {
          o.h = "0" + o.h;
        }
        return o;
      }

    });
  });
