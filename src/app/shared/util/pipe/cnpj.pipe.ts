import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cnpj' })
export class CnpjPipe implements PipeTransform {
    transform(input): string {
        // regex créditos Matheus Biagini de Lima Dias
        var str = input + '';
        str = str.replace(/\D/g, '');
        str = str.replace(/^(\d{2})(\d)/, '$1.$2');
        str = str.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        str = str.replace(/\.(\d{3})(\d)/, '.$1/$2');
        str = str.replace(/(\d{4})(\d)/, '$1-$2');
        return str;
    }
}