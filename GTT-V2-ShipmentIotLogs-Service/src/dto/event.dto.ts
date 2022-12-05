import { IsString } from "class-validator";

export default class EventDto {

    @IsString()
    private shipmentNo: string;

    constructor() {
        this.shipmentNo = "";
        console.log('Created new instance of EventDto');
    }

}