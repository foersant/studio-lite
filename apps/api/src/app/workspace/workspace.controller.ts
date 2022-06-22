import {
  Controller, Get, Header, Param, Post, StreamableFile, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceFullDto, RequestReportDto } from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';
import { UnitDownloadClass } from './unit-download.class';

@Controller('workspace/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(workspaceId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiTags('workspace')
  @ApiCreatedResponse({
    type: RequestReportDto
  })
  async addModuleFile(@WorkspaceId() workspaceId: number, @UploadedFiles() files): Promise<RequestReportDto> {
    return this.workspaceService.uploadUnits(workspaceId, files);
  }

  @Get('download/:settings')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="studio-export-units.zip"')
  @Header('Cache-Control', 'none')
  @Header('Content-Type', 'application/zip')
  @ApiTags('workspace')
  async downloadUnitsZip(
    @WorkspaceId() workspaceId: number,
      @Param('settings') unitDownloadSettingsString: string
  ): Promise<StreamableFile> {
    const unitDownloadSettings = JSON.parse(unitDownloadSettingsString);
    const file = await UnitDownloadClass.get(this.workspaceService, unitDownloadSettings);
    return new StreamableFile(file);
  }
}
