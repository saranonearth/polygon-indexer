import {Module} from '@nestjs/common';
import * as providers from './providers';

@Module({
    imports: [],
    providers: [...Object.values(providers)],
    exports: [...Object.values(providers)]
})
export class ProducerModule {
}
