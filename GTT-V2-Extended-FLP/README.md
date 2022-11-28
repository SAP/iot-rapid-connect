# GTT-V2-Sample-App-FLP

The FLP project includes 3 template applications which are Track SO Fulfllment, Track Shipments and Track Purchase Orders. Before you build and deploy it, please deploy all the UI projects you need in advance, otherwise the deployment will fail.

![](../Assets/BN4L_IOT_FLP.png)

## Deploy It with One Project

```sh
cd GTT-V2-Extended-FLP
cf login -a {API Endponit} -u {Email address} --sso
Open the link {API Endponit/password} and get passcode.
mbt build
cf deploy mta_archives/lbn-gtt-iot-app-flp_2.3.0.mtar
```

If you only need Track Shipments app, do the following changes:

1. Open `mta.yaml`

- Delete `lbn-gtt-sof-api` and `lbn-gtt-pof-api` in `lbn-gtt-sample-app-appRouter` and `resources` modules

- Delete `gtt-ui-sample-track-salesorders-app-host` and `gtt-ui-sample-track-purchaseorders-app-host` in `flp` and `resources` modules

2. Open `flp/portal-site/CommonDataModel.json`,

- Delete viz items `com.sap.gtt.app.sample.sof` and `com.sap.gtt.app.sample.pof` in `payload/catalogs/payload/viz` array

- Delete groups `salesOrder` and `purchaseOrder` in `payload/groups` array

- Delete orders `salesOrder` and `purchaseOrder` in `payload/sites/payload/groupsOrder` array
