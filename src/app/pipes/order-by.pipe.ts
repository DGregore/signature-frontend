import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: true // Make pipe standalone
})
export class OrderByPipe implements PipeTransform {

  transform<T>(value: T[] | null | undefined, key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    if (!value || value.length === 0 || !key) {
      return value || [];
    }

    return value.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return direction === 'desc' ? (comparison * -1) : comparison;
    });
  }
}

