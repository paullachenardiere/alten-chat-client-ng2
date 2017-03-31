import {Pipe, PipeTransform} from "@angular/core";

/**
 * CURRENTLY NOT IN USE
 * NEEDS TO BA AN 'AsyncPipe'
 */


@Pipe({
  name: 'reverse'
})
export class ReversePipe  implements PipeTransform {
  transform(value) {
    console.log('ReversePipe value', value);
    if(value) {
    return value.slice().reverse();
    } else {
      return '';
    }
  }
}
