import axios, { AxiosError } from 'axios';
import express, { response } from 'express';

import db from '../db/db.config.js';

class CustomController {


    // create new custom fields for shipment
    async customFields(req: express.Request, res: express.Response, next) {
        const customFields = req.body;
        const shipmentNo = customFields.shipmentNo;

        await db.none('INSERT INTO custom_fields(shipment_no, iot_device_identifier, name_of_goods, export_company, customer_code, smart_shipment_id, value_of_goods, import_company, customer_address, shipping_company, value_of_goods_currency, customer_profile, customer_id) VALUES ($(1), $(2), $(3), $(4), $(5), $(6), $(7), $(8), $(9), $(10), $(11), $(12), $(13))', {
            1: shipmentNo,
            2: customFields.iotDeviceIdentifier,
            3: customFields.nameOfGoods,
            4: customFields.exportCompany,
            5: customFields.customerCode,
            6: customFields.smartShipmentId,
            7: customFields.valueOfGoods,
            8: customFields.importCompany,
            9: customFields.customerAddress,
            10: customFields.shippingCompany,
            11: customFields.valueOfGoodsCurrency,
            12: customFields.customerProfile,
            13: customFields.customerId,
        }).then(() => {
            res.status(200).send(`Custom fields received for Shipment No: ${shipmentNo}`);
        }).catch((error) => {
            console.error(`while saving custom fields: ${error}`);
            res.status(400).send(`Error saving custom fields: ${error}`);
        })

    }

    // gets custom field details for shipment 
    async getCustomFields(req: express.Request, res: express.Response) {
        const shipmentNo = req.params.shipmentNo;

        await db.result('SELECT * FROM custom_fields WHERE shipment_no = $1', [shipmentNo])
            .then(data => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                console.error(`while returning custom fields by ID: ${error}`);
                res.status(400).send(`Error: ${error}`);
            });;

    }

    // updates custom fields for shipment
    async customFieldsUpdate(req: express.Request, res: express.Response, next) {
        const customFields = req.body;
        const shipmentNo = req.params.shipmentNo;
        await db.none('UPDATE custom_fields SET iot_device_identifier = $2, name_of_goods = $3, export_company = $4, customer_code = $5, smart_shipment_id = $6, value_of_goods = $7, import_company = $8, customer_address = $9, shipping_company = $10, value_of_goods_currency = $11, customer_profile = $12, customer_id = $13 WHERE shipment_no = $1', [
            shipmentNo,
            customFields.iotDeviceIdentifier,
            customFields.nameOfGoods,
            customFields.exportCompany,
            customFields.customerCode,
            customFields.smartShipmentId,
            customFields.valueOfGoods,
            customFields.importCompany,
            customFields.customerAddress,
            customFields.shippingCompany,
            customFields.valueOfGoodsCurrency,
            customFields.customerProfile,
            customFields.customerId,
        ]).then(() => {
            res.status(200).send(`Custom fields updated for Shipment No: ${shipmentNo}`);
        }).catch((error) => {
            console.error(`while updating custom fields: ${error}`);
            res.status(400).send(`Error updating custom fields: ${error}`);
        })
    }

    // deletes custom fields for shipment 
    async customFieldsDelete(req: express.Request, res: express.Response, next) {
        const shipmentNo = req.params.shipmentNo;

        await db.any('DELETE FROM custom_fields WHERE shipment_no = $1', [shipmentNo]).then(() => {
            res.status(200).send(`Custom fields deleted for Shipment No: ${shipmentNo}`);
        }).catch((error) => {
            console.error(`while deleting custom fields: ${error}`);
            res.status(400).send(`Error deleting custom fields: ${error}`);
        })
    }

}

export default new CustomController();