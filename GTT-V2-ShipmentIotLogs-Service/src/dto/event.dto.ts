import { IsArray, IsDateString, IsInt, IsNotEmpty, IsString } from "class-validator";

export default class EventDto {

    @IsNotEmpty()
    @IsString()
    private shipmentNo: string;

    @IsNotEmpty()
    @IsDateString()
    private reportedAt: string;

    @IsString()
    private timezone: string;

    @IsInt()
    private priority: string;

    @IsString()
    private reportedBy: string;

    @IsArray()
    private eventDetails: string[];

    constructor() {
        this.shipmentNo = "";
        this.reportedAt = "";
        this.timezone = "";
        this.priority = "";
        this.reportedBy = "";
        this.eventDetails = [];
    }
}