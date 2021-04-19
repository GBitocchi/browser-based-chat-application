import { inject } from 'inversify';
import { TYPES } from './types';

export const environment = inject(TYPES.Environment);
export const logger = inject(TYPES.Logger);
