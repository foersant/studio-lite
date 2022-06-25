import {Component, Inject} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkspaceService } from '../workspace.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html'
})
export class EditSettingsComponent {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ds: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {
    this.settingsForm = this.fb.group({
      editorSelector: this.fb.control((this.data as WorkspaceSettingsDto).defaultEditor),
      playerSelector: this.fb.control((this.data as WorkspaceSettingsDto).defaultPlayer)
    });
  }
}
