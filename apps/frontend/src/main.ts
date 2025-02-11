import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic([
  {
    provide: 'SERVER_URL',
    useValue: environment.backendUrl
  },
  {
    provide: 'APP_PUBLISHER',
    useValue: 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen'
  },
  {
    provide: 'APP_NAME',
    useValue: 'Studio-Lite'
  },
  {
    provide: 'APP_VERSION',
    useValue: '2.0.0-beta'
  }
]).bootstrapModule(AppModule)
  .catch(err => console.log(err));
