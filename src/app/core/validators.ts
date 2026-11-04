import { ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber } from './contact';

/** A form box that must hold a phone number as people write them (see isValidPhoneNumber). An empty box is left to Validators.required. */
export const phoneValidator: ValidatorFn = control => !control.value || isValidPhoneNumber(String(control.value).trim()) ? null : { phone: true };
