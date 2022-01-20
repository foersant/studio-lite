import {Body, Controller, Delete, Get, Param, Post, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserDto, UserFullDto, UserInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import {UsersService} from "../../database/services/users.service";
import {AuthService} from "../../auth/service/auth.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {WorkspaceService} from "../../database/services/workspace.service";

@Controller('admin/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private workspacesService: WorkspaceService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserInListDto],
  })
  @ApiTags('admin users')
  async findAll(@Request() req): Promise<UserInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiCreatedResponse({
    type: [UserFullDto],
  })
  @ApiTags('admin users')
  async findOne(@Request() req, @Param('id') id: number): Promise<UserFullDto> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/workspaces')
  @ApiCreatedResponse({
    type: [UserFullDto],
  })
  @ApiTags('admin users')
  async findOnesWorkspaces(@Request() req, @Param('id') id: number): Promise<WorkspaceInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspacesService.findAll(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.remove(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number,
  })
  @ApiTags('admin users')
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.create(createUserDto)
  }
}
