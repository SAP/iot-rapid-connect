import { AxiosRequestHeaders } from "axios";


export default class RequestConfig {

    private _url: string;
    private _headers: AxiosRequestHeaders;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(data: any) {
        this._url = data.destinationConfiguration.URL;
        this._headers = {} as AxiosRequestHeaders;

        if (data?.authTokens) {
            data.authTokens.forEach(
                (token: { http_header: { key: string; value: string } }) => {
                    this._headers[token.http_header.key] = token.http_header.value;
                }
            );

            this._headers["Content-Type"] = "application/json";
        }
    }

    public get url(): string {
        return this._url;
    }
    public set url(value: string) {
        this._url = value;
    }

    public get headers(): AxiosRequestHeaders {
        return this._headers;
    }
    public set headers(value: AxiosRequestHeaders) {
        this._headers = value;
    }
}
