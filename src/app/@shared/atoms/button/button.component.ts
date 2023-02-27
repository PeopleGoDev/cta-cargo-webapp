import { Component, ElementRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})

export class ButtonComponent {
  @ViewChild('button') button: ElementRef;
  @Output() buttonClicked = new EventEmitter();
  @Input() customClass: string = '';
  @Input() id: string = '';
  @Input() isBgTransparent: boolean = false;
  @Input() isBlock: boolean = false;
  @Input() isBright: boolean = false;
  @Input() isButtonOrange: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() isDisabledOpacity: boolean = false;
  @Input() isJust: boolean = false;
  @Input() isLower: boolean = false;
  @Input() isTransparent: boolean = false;
  @Input() loading: boolean = false;
  @Input() mobileFull: boolean = false;
  @Input() type: string = 'button';
  @Input() isSpaced = false;

  onClickButton(e: any) {
    if(!this.isDisabled) {
      this.buttonClicked.emit(e);
    }
  }
}
