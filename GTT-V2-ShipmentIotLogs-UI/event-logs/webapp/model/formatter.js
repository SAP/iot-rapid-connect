sap.ui.define([], function () {
  "use strict";

  return {
    executionStatus: function (v) {
      if (v == "Completed") {
        return "sap-icon://status-completed";
      } else if (v == "In Execution") {
        return "sap-icon://in-progress";
      } else {
        return "sap-icon://up";
      }
    },
    executionStatusState: function (v) {
      if (v == "Completed") {
        return "Success";
      } else if (v == "In Execution") {
        return "Information";
      }
    },
    transportationMode: function (v) {
      if (v == "Maritime transport") {
        return "sap-icon://BusinessSuiteInAppSymbols/icon-ship";
      } else if (v == "Train transport") {
        return "sap-icon://cargo-train";
      } else if ("Air transport") {
        return "sap-icon://flight";
      }
    },
    logStatus: function (v) {
      if (v == "Success") {
        return "sap-icon://status-completed";
      } else if (v == "Error") {
        return "sap-icon://status-error";
      } else if (v == "Failed") {
        return "sap-icon://status-error";
      } else if (v == "Pending") {
        return "sap-icon://pending";
      } else if (v == "In Process") {
        return "sap-icon://in-progress";
      } else if (v == "Warning") {
        return "sap-icon://alert";
      }
    },
    logState: function (v) {
      if (v == "Pending") {
        return "Warning";
      } else if (v == "In Process") {
        return "Success";
      } else if (v == "Failed") {
        return "Error";
      } else if (v == "Successful") {
        return "Success";
      }
      return v;
    }
  };
});
