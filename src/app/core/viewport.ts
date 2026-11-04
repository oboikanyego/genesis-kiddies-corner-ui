import { signal } from '@angular/core';

/**
 * True on phones and narrow windows. The phone layout starts at 899px, the same breakpoint as in styles.scss.
 * Pages use it to build only the layout that is on screen, so a phone never downloads pictures meant for computers.
 */
const query = typeof matchMedia === 'function' ? matchMedia('(max-width: 899px)') : null;
export const phoneLayout = signal(query?.matches ?? false);
query?.addEventListener('change', event => phoneLayout.set(event.matches));
