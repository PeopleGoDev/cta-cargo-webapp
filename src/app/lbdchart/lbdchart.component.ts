import { ChangeDetectionStrategy, Component, Input, OnInit, AfterViewInit } from '@angular/core';
import * as Chartist from 'chartist';

export interface LegendItem {
  title: string;
  imageClass: string;
}

export enum ChartType {
  Pie,
  Line,
  Bar
}

@Component({
  selector: 'app-lbdchart',
  templateUrl: './lbdchart.component.html',
  styleUrls: ['./lbdchart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LbdchartComponent implements OnInit, AfterViewInit {
  
  constructor() { }

  @Input() title: string;
  @Input() subtitle: string;
  @Input() chartClass: string;
  @Input() chartType: ChartType;
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() chartResponsive: any[];
  @Input() footerIconClass: string;
  @Input() footerText: string;
  @Input() legendItems: LegendItem[];
  @Input() withHr: boolean;

  static currentId = 1;
  chartId: string;

  ngOnInit(): void {
    this.chartId = `lbd-chart-${LbdchartComponent.currentId++}`;
  }

  public ngAfterViewInit(): void {

    switch (this.chartType) {
      case ChartType.Pie:
        new Chartist.Pie(`#${this.chartId}`, this.chartData, this.chartOptions, this.chartResponsive);
        break;
      case ChartType.Line:
        new Chartist.Line(`#${this.chartId}`, this.chartData, this.chartOptions, this.chartResponsive);
        break;
      case ChartType.Bar:
        new Chartist.Bar(`#${this.chartId}`, this.chartData, this.chartOptions, this.chartResponsive);
        break;
    }
  }

}
