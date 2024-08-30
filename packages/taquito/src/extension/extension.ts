import { Context } from '../context.js'

export interface Extension {

    configureContext(context: Context): void;

}