import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string, format: string = 'D MMM, YYYY'): string {
    return moment.utc(value, 'Do MMM YYYY, h:mm a', 'el').format(format);
  }

}
