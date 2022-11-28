import { readCFServices, getServices, loadEnv } from "@sap/xsenv";
import axios from "axios";
import { stringify } from "qs";
import Logger from "./logger.config.js";
loadEnv();

const services = readCFServices();
const serviceDestination = getServices(
    { destination: { tag: "destination" } },
    services
);

// Get token from Cloud Foundry
const getAuthToken = async () => {
    const auth = Buffer.from(
        serviceDestination.destination.clientid +
        ":" +
        serviceDestination.destination.clientsecret
    ).toString("base64");
    const data = stringify({
        grant_type: "client_credentials",
    });
    const url = `${serviceDestination.destination.url}/oauth/token`;

    try {
        const xsuaaToken = await axios.post(url, data,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            });

        return xsuaaToken?.data.access_token;
    } catch (error) {
        Logger.error("xsuaa token error:" + error);
    }
};

// Get destination from Cloud Foundry
const DestinationConfig = async (sDestination: string) => {
    const token = await getAuthToken();
    const url = `${serviceDestination.destination.uri}/destination-configuration/v1/destinations/${sDestination}`
    try {
        const getConfig = await axios.get(url,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        return getConfig;

    } catch (error) {
        Logger.error("Destination error:" + error);
    }
};

export default DestinationConfig;
