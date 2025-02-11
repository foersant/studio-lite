import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, ApplicationModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { BackendService } from './backend.service';
import { AboutComponent } from './home/about.component';
import { HomeComponent } from './home/home.component';
import { ChangePasswordComponent } from './home/change-password.component';
import { AuthInterceptor } from './auth.interceptor';
import { AppTranslateLoader } from './app-translate-loader';
import { RequestMessageDialogComponent } from './components/request-message-dialog.component';
import { InputTextComponent } from './components/input-text.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        AboutComponent,
        ChangePasswordComponent,
        RequestMessageDialogComponent,
        InputTextComponent
    ],
    imports: [
        ApplicationModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatMenuModule,
        MatToolbarModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatTabsModule,
        MatTableModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        FlexLayoutModule,
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        IqbComponentsModule.forRoot(),
        TranslateModule.forRoot({
            defaultLanguage: 'de',
            loader: {
                provide: TranslateLoader,
                useClass: AppTranslateLoader
            }
        })
    ],
    providers: [
        BackendService,
        MatDialog,
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
