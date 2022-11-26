sap.ui.define([
  "com/sap/gtt/app/iot/sst/Component",
  "com/sap/gtt/app/iot/sst/controller/ErrorHandler",
], function (Component, ErrorHandler) {
  "use strict";

  var sandbox = sinon.sandbox.create();

  function stub(object, method, func) {
    if (!(method in object)) {
      object[method] = function () {};
    }

    var stubbed = sandbox.stub(object, method);

    if (typeof func === "function") {
      return stubbed.callsFake(func);
    }

    return stubbed;
  }

  QUnit.module("Component", {
    beforeEach: function () {},
    afterEach: function () {
      sandbox.restore();
    },
  });

  QUnit.test("Test case", function (assert) {
    // Arrange
    stub(ErrorHandler.prototype, "attachMetadataFailedHandler");
    stub(Component.prototype, "createContent");

    var fakeRootControl = {};
    stub(fakeRootControl, "createId");
    stub(Component.prototype, "getRootControl").returns(fakeRootControl);

    // Act
    var COMPONENT_NAME = "com.sap.gtt.app.iot.sst";
    var component = new Component();
    var componentName = component.getComponentName();

    // Assert
    assert.strictEqual(componentName, COMPONENT_NAME, "component name is correct");
  });
});
