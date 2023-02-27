import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-base-control',
  template: '<div></div>',
})

export abstract class InputBaseControlValueAcessor implements ControlValueAccessor {
  @ViewChild('input') inputElm: ElementRef;

  @Input() inputId: string = '';

  @Input() name: string = '';

  @Input() isDisabled = false;

  @Input() placeholder: string = '';

  @Input() inputLabel: any;

  @Input() inputValue: any;

  @Input() checked = false;

  @Input() focusInput = false;

  @Output() focusInputEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() blurInputEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() pressInputEvent: EventEmitter<any> = new EventEmitter<any>();

  blurInput: boolean = false;

  protected innerValue: any;

  @Input() get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.value) {
      this.innerValue = v;
      this.onChangeCb(v);
      this.onToucheCb(v);
    }
  }

  onChangeCb: (_: any) => void = () => {};

  onToucheCb: (_: any) => void = () => {};

  writeValue(v: any): void {
    this.value = v;
    if (!v) {
      this.inputLabel = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: any): void {
    this.onToucheCb = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFocus(event: any): void {
    this.blurInput = true;
    this.focusInputEvent.emit(true);
    event.focus();
  }

  onBlur(event: any): void {
    this.blurInput = false;
    this.blurInputEvent.emit(false);
    this.onToucheCb(event.target);
  }

  pressKey(e: any): void {
    const keys = ['ArrowUp', 'ArrowDown'];
    if (keys.indexOf(e.key) >= 0) {
      e.preventDefault();
    }
    this.pressInputEvent.emit(e.key);
  }
}
