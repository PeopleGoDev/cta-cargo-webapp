import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'master' })
export class MasterPipe implements PipeTransform {
    transform(input): string {
        var str = input + '';
        return str.replace(/^([A-B0-9]{3})/, '$1-');
    }
}