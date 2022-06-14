import { catchError, map } from 'rxjs/operators';
import {HttpHeaders, HttpClient, HttpEvent} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import {
  CreateUnitDto, UnitDefinitionDto,
  UnitInListDto,
  UnitMetadataDto, VeronaModuleFileDto,
  VeronaModuleInListDto,
  WorkspaceFullDto
} from "@studio-lite-lib/api-dto";
import {AppHttpError} from "../app.classes";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUnitList(workspaceId: number): Observable <UnitInListDto[]> {
    return this.http
      .get<UnitInListDto[]>(`${this.serverUrl}workspace/${workspaceId}/units`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getWorkspaceData(workspaceId: number): Observable<WorkspaceFullDto> {
    return this.http
      .get<WorkspaceFullDto>(
      `${this.serverUrl}workspace/${workspaceId}`
    )
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addUnit(workspaceId: number, newUnit: CreateUnitDto): Observable<number> {
    return this.http
      .post<number>(`${this.serverUrl}workspace/${workspaceId}/units`, newUnit)
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map(returnId => Number(returnId))
      );
  }

  copyUnit(workspaceId: number,
           fromUnit: number, key: string, label: string): Observable<number> {
    return this.http
      .put<string>(`${this.serverUrl}addUnit.php`,
      {
        t: localStorage.getItem('t'), ws: workspaceId, u: fromUnit, k: key, l: label
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map(returnId => Number(returnId))
      );
  }

  deleteUnits(workspaceId: number, units: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspace/${workspaceId}/${units.join(';')}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  moveUnits(workspaceId: number,
            units: number[], targetWorkspace: number): Observable<boolean | number> {
    const authToken = localStorage.getItem('t');
    if (!authToken) {
      return of(401);
    }
    return this.http
      .put<UnitInListDto[]>(`${this.serverUrl}moveUnits.php`,
      {
        t: authToken, ws: workspaceId, u: units, tws: targetWorkspace
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map((unMovableUnits: UnitInListDto[]) => {
          if (unMovableUnits.length === 0) return true;
          return unMovableUnits.length;
        })
      );
  }

  downloadUnits(workspaceId: number, unitData: ExportUnitSelectionData): Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        options: JSON.stringify({ t: localStorage.getItem('t'), ws: workspaceId, u: unitData })
      })
    };
    return this.http.get<Blob>(`${this.serverUrl}downloadUnits.php`, httpOptions);
  }

  getUnitMetadata(workspaceId: number, unitId: number): Observable<UnitMetadataDto> {
    return this.http
      .get<UnitMetadataDto>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/metadata`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getUnitDefinition(workspaceId: number, unitId: number): Observable<UnitDefinitionDto> {
    return this.http
      .get<UnitDefinitionDto>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/definition`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setUnitMetadata(workspaceId: number, unitData: UnitMetadataDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitData.id}/metadata`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  startUnitUploadProcessing(workspaceId: number, processId: string): Observable<ImportUnitSelectionData[]> {
    return this.http
      .post<ImportUnitSelectionData[]>(`${this.serverUrl}startUnitUploadProcessing.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      p: processId
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  uploadUnits(workspaceId: number, files: FileList | null): Observable<boolean | HttpEvent<any>> {
    if (files) {
      const formData = new FormData();
      for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      return this.http.post(`${this.serverUrl}workspace/${workspaceId}/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      })
    } else {
      return of(false)
    }
  }

  setUnitDefinition(workspaceId: number, unitId: number, unitData: UnitDefinitionDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitId}/definition`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getModuleHtml(moduleId: string): Observable<VeronaModuleFileDto> {
    return this.http
      .get<VeronaModuleFileDto>(`${this.serverUrl}admin/verona-module/${moduleId}`)
      .pipe(
        catchError(() => of (<VeronaModuleFileDto>{}))
      );
  }

  getModuleList(type: string): Observable<VeronaModuleInListDto[]> {
    return this.http
      .get<VeronaModuleInListDto[]>(`${this.serverUrl}admin/verona-modules/${type}`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspaceSettings(workspaceId: number, settings: WorkspaceSettings): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setWorkspaceSettings.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      s: settings
    })
      .pipe(
        catchError(() => of(false))
      );
  }
}

export interface UnitMetadata {
  id: number;
  key: string;
  label: string;
  description: string;
  lastchanged: number;
  editorid: string;
  playerid: string;
}

export interface ModulData {
  label: string;
  html: string;
}

export interface WorkspaceData {
  id: number;
  label: string;
  group: string;
  settings: WorkspaceSettings;
  players: {
    [key: string]: ModulData;
  };
  editors: {
    [key: string]: ModulData;
  };
}

export interface ModuleDataForExport {
  id : string;
  content : string
}

export interface ExportUnitSelectionData {
  selected_units: number[];
  add_players: string[];
  add_xml: ModuleDataForExport[];
}

export interface ImportUnitSelectionData {
  filename: string;
  success: boolean;
  message: string;
}

export interface WorkspaceSettings {
  defaultPlayer: string;
  defaultEditor: string
}
