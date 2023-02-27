import { Component, forwardRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseControlValueAcessor } from '@shared/input-base-control-value-acessor';
import { TextMaskConfig } from 'angular2-text-mask';

const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputComponent),
  multi: true,
};

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [INPUT_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
})

export class InputComponent extends InputBaseControlValueAcessor implements OnInit {
  @Input() afterLabel: string;
  @Input() figureAlt: string;
  @Input() figureUrl: string;
  @Input() isCalendar: boolean = false;
  @Input() isInternalError: boolean = false;
  @Input() isReadonly: boolean = false;
  @Input() isRequired: boolean = false;
  @Input() label: string;
  @Input() mask: TextMaskConfig = { mask: false };
  @Input() maxlength: number | null;
  @Input() messageError: any;
  @Input() minlength: number | null;
  @Input() type: string = 'text';
  @Input() urlFigure: string = '';
  @Input() upperCase: boolean = false;
  @Input() onPaste = true;
  @Input() autocomplete = 'off';

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.innerValue = this.inputValue;
  }

  setOnPaste() {
    this.inputElm.nativeElement.onpaste = () => this.onPaste;
  }
}
