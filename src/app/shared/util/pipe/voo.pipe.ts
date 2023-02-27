import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'voo' })
export class VooPipe implements PipeTransform {
    transform(input): string {
        return input.substring(0,2) + ' ' + input.substring(2);
    }
}