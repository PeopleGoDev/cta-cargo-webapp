import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-master-detail',
  templateUrl: './master-detail.component.html',
  styleUrls: ['./master-detail.component.scss']
})
export class MasterDetailComponent implements OnInit {

  companyName: string;
  readyOnly: boolean = false;
  portList: any = [{
    value: 'VCP',
    label: 'Viracópos'
  }];

  constructor() { }

  ngOnInit(): void {
  }

}
