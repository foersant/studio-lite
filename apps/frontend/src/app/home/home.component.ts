import {ActivatedRoute, Router} from '@angular/router';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService, WorkspaceData } from '../backend.service';
import { MainDatastoreService } from '../maindatastore.service';
import { ChangePasswordComponent } from './change-password.component';
import {AuthService} from "../auth.service";
import {WorkspaceDto} from "@studio-lite-lib/api-start";
import {Subscription} from "rxjs";

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isError = false;
  errorMessage = '';
  dataLoading = true;
  private routingSubscription: Subscription | null = null;
  redirectTo = '';

  constructor(private fb: FormBuilder,
              @Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string,
              public mds: MainDatastoreService,
              private bs: BackendService,
              public confirmDialog: MatDialog,
              private changePasswordDialog: MatDialog,
              private snackBar: MatSnackBar,
              public authService: AuthService,
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
      this.mds.pageTitle = 'Willkommen!';
      this.dataLoading = false;
      const token = localStorage.getItem('id_token');
      if (token) {
        this.authService.getAuthData().subscribe(authData => {
          this.authService.authData = authData
        })
      }
    });
  }

  login(): void {
    this.isError = false;
    this.errorMessage = '';
    this.dataLoading = true;
    if (this.loginForm && this.loginForm.valid) {
      this.authService.login(this.loginForm.get('name')?.value, this.loginForm.get('pw')?.value).subscribe(() => {
          this.dataLoading = false;
          console.log(this.redirectTo);
          if (this.redirectTo) {
            this.router.navigate([this.redirectTo]);
          }
        },
      err => {
        this.isError = true;
        this.dataLoading = false;
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
        this.authService.logout();
      }
    });
  }

  changePassword() : void {
    const dialogRef = this.changePasswordDialog.open(ChangePasswordComponent, {
      width: '400px',
      height: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.bs.setUserPassword(result.controls.pw_old.value, result.controls.pw_new1.value).subscribe(
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
