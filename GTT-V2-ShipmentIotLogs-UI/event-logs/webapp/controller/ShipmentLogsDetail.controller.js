sap.ui.define([
  "eventlogs/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "eventlogs/model/formatter"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageBox, formatter) {
    "use strict";

    return Controller.extend("eventlogs.controller.ShipmentLogsDetail", {
      formatter: formatter,

      //excute when the page first loads
      onInit: function () {
        var oView = this.getView();

        /*
          There will be error if we set the data from backend directly.
          So we need to init the process flow first. 
        */
        var nodes = {
          visible: true,
          "nodes": [
            {
              "id": "1",
              "lane": "0",
              "title": "",
              "titleAbbreviation": "",
              "children": [2],
              "state": "Positive",
              "stateText": "",
              "focused": true,
              "texts": null
            },
            {
              "id": "2",
              "lane": "1",
              "title": "",
              "titleAbbreviation": "",
              "children": [],
              "state": "Negative",
              "stateText": "",
              "focused": false,
              "texts": null
            }
          ],
          "lanes": [
            {
              "id": "0",
              "icon": "sap-icon://order-status",
              "label": "In Order",
              "position": 0
            },
            {
              "id": "1",
              "icon": "sap-icon://payment-approval",
              "label": "In Invoice",
              "position": 1
            }
          ]
        };
        var oModel = new JSONModel(nodes);
        oView.setModel(oModel);
        var oProcessFlow = oView.byId("processflow");
        oProcessFlow.updateModel();
        this.getRouter().getRoute("TargetLogsDetail").attachPatternMatched(this.loadEventLogsDetail, this);
      },

      //excute when the detial page is loaded, call backend to get the latest detail data.
      loadEventLogsDetail: function (oEvent) {
        var oView = this.getView();

        //mock data for local development
        // var oDetailModel = new JSONModel();
        // oDetailModel.loadData("../data/logsDetailMockData.json", false);
        // oView.setModel(oDetailModel, "detailModel");

        //Get the process flow data from backend.
        var requestId = oEvent.getParameter("arguments").id,
          reportedAt = oEvent.getParameter("arguments").date;
        var sUrl = sap.ui.require.toUrl("eventlogs" + "/shipmentLogTest/api/v1/iot/shipment/" + requestId + "/events/" + reportedAt + "/processFlow");
        jQuery.ajax({
          url: sUrl,
          type: "GET",
          async: false,
          success: function (oData) {
            var nodes = {}, nodeList = [], lineList = [], eventNode = {}, eventLine = {}, lbnNode = {}, lbnLine = {};
            if (oData.event.push.length != 0) {
              var eventPush = oData.event.push[0];
              eventNode.id = "1";
              eventNode.lane = "0";
              eventNode.title = "Shipment Number:" + eventPush.shipment_no;
              eventNode.state = "Positive";
              eventNode.stateText = "Successful";
              eventNode.focused = true;
              eventNode.texts = null;
              eventNode.children = [2];
              nodeList.push(eventNode);
              eventLine.id = "0";
              eventLine.icon = "sap-icon://order-status";
              eventLine.label = "IoT Event";
              eventLine.position = 0;
              lineList.push(eventLine);
            }
            if (oData.lbn_response.push.length != 0) {
              var lbnPush = oData.lbn_response.push[0];
              lbnNode.id = "2";
              lbnNode.lane = "1";
              lbnNode.title = "Trackig process Shipment Number:" + lbnPush.shipment_no;
              lbnNode.state = lbnPush.status == "Success" ? "Positive" : "Negative";
              lbnNode.stateText = lbnPush.status;
              lbnNode.focused = false;
              lbnNode.texts = null;
              lbnNode.children = [];
              nodeList.push(lbnNode);
              lbnLine.id = "1";
              lbnLine.icon = "sap-icon://chain-link";
              lbnLine.label = "LBN Event";
              lbnLine.position = 1;
              lineList.push(lbnLine);
            } else {
              nodes.visible = false;
            }
            nodes.nodes = nodeList;
            nodes.lanes = lineList;
            var oModel = new JSONModel(nodes);
            oView.setModel(oModel);
            var oProcessFlow = oView.byId("processflow");
            oProcessFlow.updateModel();
          }
        });

        //Get the top data and payload from backend.
        var sUrl2 = sap.ui.require.toUrl("eventlogs" + "/shipmentLogTest/api/v1/iot/shipment/" + requestId + "/events/" + reportedAt);
        jQuery.ajax({
          url: sUrl2,
          type: "GET",
          async: false,
          success: function (oData) {
            var oDetail = {};
            oDetail.requestId = oData[0].shipment_no;
            oDetail.updatedAt = new Date(oData[0].updated_at);
            oDetail.reportedAt = new Date(oData[0].reported_at);
            oDetail.reported_at = oData[0].reported_at;
            oDetail.updated_at = oData[0].updated_at;
            oDetail.reportedBy = oData[0].event_body.reportedBy;
            oDetail.status = "Success";
            oDetail.priority = oData[0].event_body.priority;
            oDetail.payload = JSON.stringify(oData[0].event_body.eventDetails, undefined, 4);
            oDetail.responseData = "Event Received Successfully";
            oView.setModel(new JSONModel(oDetail), "detailModel");
          }
        });
      },

      /*
        When click first node, nothing will haapen because this page is about IoT detail.
        When click second node, the page will jump to the lbn detail page.
      */
      onNodePress: function (oEvent) {
        var oView = this.getView();
        var sId = oView.getModel("detailModel").getProperty("/requestId"),
          reportedAt = oView.getModel("detailModel").getProperty("/reported_at");
        if (oEvent.getParameter("mBindingInfos").nodeId.binding.oValue == "2") {
          this.getRouter().navTo("TargetLogsDetailProcess", { id: sId, date: reportedAt });
        }
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



