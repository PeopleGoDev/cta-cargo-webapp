import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseControlValueAcessor } from '@shared/input-base-control-value-acessor';
import { Observable, Subscription } from 'rxjs';

const SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true,
};

export interface IListSelect {
  label: string;
  value: string | number;
  checked?: boolean;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [SELECT_VALUE_ACCESSOR],
})
export class SelectComponent extends InputBaseControlValueAcessor implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Output() activeAcordionInput = new EventEmitter();
  @Output() optionID = new EventEmitter();
  @Output() selectValue = new EventEmitter();

  @Input() isRequired: boolean = false;
  @Input() label: string = '';
  @Input() list: IListSelect[] = [];
  @Input() messageError: any;
  @Input() events: Observable<void>;

  heightContent: string = '';
  isActive: boolean = false;
  maxItens: number = 4;
  selectedOption: number = -1;

  private eventsSubscription: Subscription;

  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isActive = false;
    }
  }

  constructor(private eRef: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.innerValue = this.inputValue;

    if (this.events) {
      this.eventsSubscription = this.events.subscribe(data => this.updateInputValue(data));
    }

    if (this.inputValue) {
      this.updateInputValue(this.inputValue);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.findOption();
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  updateInputValue(value): void {
    const selectedItem = this.list.find(item => item.value === value);
    if (selectedItem) this.inputLabel = selectedItem.label;
  }

  inputLabelValue(value: string): string {
    const data = this.list?.find(v => v.value === value);
    return value && data ? data?.label : '';
  }

  ngAfterViewInit(): void {
    this.findOption();
  }

  activeAcordion(event, input?): void {
    this.isActive = !this.isActive;
    event.stopPropagation();

    if (input && this.isActive) {
      input.focus();
      event.preventDefault();
      this.activeAcordionInput.emit();
    }

    this.findHeight(event);
  }

  labelPrevent(event): void {
    event.preventDefault();
  }

  findHeight(event): void {
    const content = event.target.closest('.m-select__accordion'); //  .m-select__content //
    const height = content.querySelector('.m-select__list').offsetHeight;
    this.heightContent = `${height}px`;
  }

  selecValue(event, targ: string): void {
    const value = targ;
    this.inputLabel = this.list?.find(v => v.value === value).label;
    this.value = value;
    this.onChangeCb(value);
    this.selectValue.emit(this.value);
    this.optionID.emit(targ);
    this.isActive = !this.isActive;
  }

  selectByOption(event, direction): void {
    event.preventDefault();
    const content = event.target.closest('.m-select__accordion');
    const option = content.getElementsByClassName('m-select__list-anchor');
    const max = option.length - 1;

    switch (direction) {
      case 'down':
        this.onPressDown(option, max);
        break;
      case 'up':
        this.onPressUp(option, max);
        break;
      default:
        break;
    }
    this.isActive = true;
  }

  onPressDown(option, max): void {
    if (this.selectedOption === max) {
      option[0].click();
      this.selectedOption = 0;
    } else {
      this.selectedOption += 1;
      option[this.selectedOption].click();
    }
  }

  onPressUp(option, max): void {
    if (this.selectedOption < 1) {
      option[max].click();
      this.selectedOption = max;
    } else {
      this.selectedOption -= 1;
      option[this.selectedOption].click();
    }
  }

  closeOnBlur(event): void {
    this.onBlur(event);
    this.isActive = false;
  }

  private findOption(): void {
    const option = this.list?.find(list => list.value === this.value);
    if (option) {
      this.inputLabel = option.label;
      this.value = option.value;
    }
  }
}
