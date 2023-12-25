import { Component, Input, OnInit } from '@angular/core';

export interface CloneSegment {
  FlightId: number,
  SegmentId: number,
  NewFlightName: string,
}

@Component({
  selector: 'app-voo-clone-segment',
  templateUrl: './voo-clone-segment.component.html',
  styleUrls: ['./voo-clone-segment.component.css']
})
export class VooCloneSegmentComponent implements OnInit {
  cloneSegment: CloneSegment;
  nameEditorOptions: Object;
  buttonOptions: any = {
    text: 'Gerar',
    type: 'success',
    useSubmitBehavior: true,
  }
  @Input() flightInfo: any;
  
  constructor() {
    this.nameEditorOptions = { disabled: false, maxLength: 6, mask: 'AA0000' };
   }

  ngOnInit(): void {
  }

}
