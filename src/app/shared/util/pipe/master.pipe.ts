import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'master' })
export class MasterPipe implements PipeTransform {
    transform(input): string {
        // regex créditos Matheus Biagini de Lima Dias
        var str = input + '';
        str = str.replace(/\D/g, '');
        str = str.replace(/^(\d{3})(\d)/, '$1-$2');
        return str;
    }
}