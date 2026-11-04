import { Pipe, PipeTransform } from '@angular/core';
import { PhotoSize, photoSized } from '../core/service-photos';

/** {{ service.image | photo:'sm' }} → the small version of one of our images, so thumbnails stay light. */
@Pipe({ name: 'photo', standalone: true })
export class PhotoPipe implements PipeTransform {
  transform(url: string | null | undefined, size: PhotoSize = 'md'): string {
    return url ? photoSized(url, size) : '';
  }
}
