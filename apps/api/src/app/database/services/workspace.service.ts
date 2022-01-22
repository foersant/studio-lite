import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository} from "typeorm";
import Workspace from "../entities/workspace.entity";
import {CreateWorkspaceDto, UserFullDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import User from "../entities/user.entity";
import WorkspaceUser from "../entities/workspace-user.entity";
import {WorkspaceGroupDto} from "@studio-lite-lib/api-start";
import WorkspaceGroup from "../entities/workspace-group.entity";

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>
  ) {}

  async findAll(userId?: number): Promise<WorkspaceInListDto[]> {
    const validWorkspaces: number[] = [];
    if (userId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository.find({ where: {userId: userId}});
      workspaceUsers.forEach(wsU => validWorkspaces.push(wsU.workspaceId))
    }
    const workspaces: Workspace[] = await this.workspacesRepository.find({order: {name: 'ASC'}});
    const returnWorkspaces: WorkspaceInListDto[] = [];
    workspaces.forEach(workspace => {
      if (!userId || (validWorkspaces.indexOf(workspace.id) > -1)) {
        returnWorkspaces.push(<WorkspaceInListDto>{
          id: workspace.id,
          name: workspace.name,
          groupId: workspace.groupId
        })
      }
    });
    return returnWorkspaces;
  }

  async setWorkspacesByUser(userId: number, workspaces: number[]) {
    await getConnection().createQueryBuilder()
      .delete()
      .from(WorkspaceUser)
      .where("user_id = :id", { id: userId })
      .execute();
    for (const workspaceId of workspaces) {
      const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
        userId: userId,
        workspaceId: workspaceId
      });
      await this.workspaceUsersRepository.save(newWorkspaceUser);
    }
  }

  async findAllGroupwise(userId?: number): Promise<WorkspaceGroupDto[]> {
    const workspaceGroups = await this.workspaceGroupRepository.find({order: {name: 'ASC'}});
    const workspaces = await this.findAll(userId);
    const myReturn: WorkspaceGroupDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      const localWorkspaceGroup = <WorkspaceGroupDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        workspaces: []
      }
      workspaces.forEach(workspace => {
        if (workspaceGroup.id === workspace.groupId) {
            localWorkspaceGroup.workspaces.push(workspace)
        }
      });
      myReturn.push(localWorkspaceGroup)
    })
    return myReturn;
  }

  async findOne(id: number): Promise<WorkspaceFullDto> {
    const workspace = await this.workspacesRepository.findOne(id);
    return <WorkspaceFullDto>{
      id: workspace.id,
      name: workspace.name,
      settings: workspace.settings,
      groupId: workspace.groupId
    }
  }

  async create(workspace: CreateWorkspaceDto ): Promise<number> {
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  async patch(workspaceData: WorkspaceFullDto): Promise<void> {
    const workspaceRepository = await getConnection().getRepository(Workspace);
    const workspaceToUpdate = await workspaceRepository.findOne(workspaceData.id);
    if (workspaceData.name) workspaceToUpdate.name = workspaceData.name;
    if (workspaceData.groupId) workspaceToUpdate.groupId = workspaceData.groupId;
    await workspaceRepository.save(workspaceToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    await this.workspacesRepository.delete(id);
  }
}
