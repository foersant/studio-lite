import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateUnitDto,
  UnitDefinitionDto,
  UnitInListDto,
  UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { UnitService } from '../database/services/unit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';

@Controller('workspace/:workspace_id')
export class UnitsController {
  constructor(
    private unitService: UnitService
  ) {}

  @Get('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitInListDto]
  })
  @ApiTags('workspace')
  async findAll(@WorkspaceId() workspaceId: number): Promise<UnitInListDto[]> {
    return this.unitService.findAll(workspaceId);
  }

  @Get('units/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitMetadataDto]
  })
  @ApiTags('workspace')
  async findAllWithMetadata(@WorkspaceId() workspaceId: number): Promise<UnitMetadataDto[]> {
    return this.unitService.findAllWithMetadata(workspaceId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiTags('workspace unit')
  async findOnesMetadata(
      @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitMetadataDto> {
    return this.unitService.findOnesMetadata(unitId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitDefinitionDto
  })
  @ApiTags('workspace unit')
  async findOnesDefinition(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }

  @Get(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitSchemeDto
  })
  @ApiTags('workspace unit')
  async findOnesScheme(
      @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }

  @Patch(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchMetadata(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitMetadataDto: UnitMetadataDto) {
    return this.unitService.patchMetadata(unitId, unitMetadataDto);
  }

  @Patch(':ids/moveto/:target')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchWorkspace(@Param('ids') ids: string,
                       @Param('target', ParseIntPipe) targetWorkspaceId: number) {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.patchWorkspace(idsAsNumberArray, targetWorkspaceId);
  }

  @Patch(':ids/copyto/:target')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async copy(@Param('ids') ids: string,
             @Param('target', ParseIntPipe) targetWorkspaceId: number) {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.copy(idsAsNumberArray, targetWorkspaceId);
  }

  @Patch(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchDefinition(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitDefinitionDto: UnitDefinitionDto) {
    return this.unitService.patchDefinition(unitId, unitDefinitionDto);
  }

  @Patch(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchScheme(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitSchemeDto: UnitSchemeDto) {
    return this.unitService.patchScheme(unitId, unitSchemeDto);
  }

  @Post('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new unit in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async create(@WorkspaceId() workspaceId: number,
    @Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(workspaceId, createUnitDto);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiTags('workspace unit')
  async remove(@WorkspaceId() workspaceId: number,
    @Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.remove(idsAsNumberArray);
  }
}
