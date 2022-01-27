import {ActivatedRoute, Router} from '@angular/router';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../backend.service';
import { AppService } from '../app.service';
import { ChangePasswordComponent } from './change-password.component';
import {WorkspaceDto} from "@studio-lite-lib/api-dto";
import {Subscription} from "rxjs";

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isError = false;
  errorMessage = '';
  private routingSubscription: Subscription | null = null;
  redirectTo = '';

  constructor(private fb: FormBuilder,
              @Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string,
              public appService: AppService,
              private backendService: BackendService,
              public confirmDialog: MatDialog,
              private changePasswordDialog: MatDialog,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private router: Router) {
    this.loginForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(1)]),
      pw: this.fb.control('', [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.routingSubscription = this.route.queryParams.subscribe(queryParams => {
      console.log(queryParams);
      this.redirectTo = queryParams['redirectTo'];
    });
    setTimeout(() => {
      this.appService.appConfig.setPageTitle('Willkommen!');
      this.appService.dataLoading = false;
      const token = localStorage.getItem('id_token');
      if (token) {
        this.backendService.getAuthData().subscribe(authData => {
          this.appService.authData = authData
        })
      }
    });
  }

  login(): void {
    this.isError = false;
    this.errorMessage = '';
    this.appService.dataLoading = true;
    if (this.loginForm && this.loginForm.valid) {
      this.backendService.login(this.loginForm.get('name')?.value, this.loginForm.get('pw')?.value).subscribe(() => {
          this.appService.dataLoading = false;
          console.log(this.redirectTo);
          if (this.redirectTo) {
            this.router.navigate([this.redirectTo]);
          }
        },
      err => {
        this.isError = true;
        this.appService.dataLoading = false;
        // this.errorMessage = `${err.msg()}`;
      });
    }
  }

  logout(): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '300px',
      data: <ConfirmDialogData>{
        title: 'Abmelden',
        content: 'Möchten Sie sich abmelden?',
        confirmbuttonlabel: 'Abmelden',
        showcancel: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.backendService.logout();
      }
    });
  }

  changePassword() : void {
    const dialogRef = this.changePasswordDialog.open(ChangePasswordComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.backendService.setUserPassword(result.controls.pw_old.value, result.controls.pw_new1.value).subscribe(
          respOk => {
            this.snackBar.open(
              respOk ? 'Neues Kennwort gespeichert' : 'Konnte Kennwort nicht ändern.',
              respOk ? 'OK' : 'Fehler', { duration: 3000 }
            );
          }
        );
      }
    });
  }

  buttonGotoWorkspace(selectedWorkspace: WorkspaceDto): void {
    this.router.navigate([`/a/${selectedWorkspace.id}`]);
  }

  scrollTo(targetElementId: string): void {
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) targetElement.scrollIntoView();
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
