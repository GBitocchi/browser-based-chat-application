import { injectable } from 'inversify';
import { Controller } from 'inversify-express-utils';

@injectable()
@Controller('/api')
export class RequestController {
}