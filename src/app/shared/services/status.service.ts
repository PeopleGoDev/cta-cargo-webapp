import { Injectable } from "@angular/core";
import { StatusVoo } from "../model/statusvoo";

@Injectable({
    providedIn: 'root'
})

export class StatusService {

    statusData: StatusVoo[] = [
        new StatusVoo(0, 'Informação insuficientes para envio'),
        new StatusVoo(1, 'Pronto para envio RFB'),
        new StatusVoo(2, 'Recebido pela RFB'),
    ];
    
    statusRFB: StatusVoo[] = [
        new StatusVoo(0, 'Not Submitted'),
        new StatusVoo(1, 'Received'),
        new StatusVoo(2, 'Processed'),
        new StatusVoo(3, 'Rejected'),
        new StatusVoo(4, 'Received Deletion'),   
    ];

    constructor() { }

    getStatus() : Array<StatusVoo> {
        return this.statusData;
    }

    getStatusRFB() : Array<StatusVoo> {
        return this.statusRFB;
    }
}