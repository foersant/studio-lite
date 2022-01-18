import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatastoreService } from '../datastore.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrls: ['./edit-settings.component.css']
})
export class EditSettingsComponent {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ds: DatastoreService
  ) {
    this.settingsForm = this.fb.group({
      editorSelector: this.fb.control(this.ds.defaultEditor),
      playerSelector: this.fb.control(this.ds.defaultPlayer)
    });
  }
}
