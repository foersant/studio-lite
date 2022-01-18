import {Injectable} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import User from "../entities/user.entity";
import * as bcrypt from 'bcrypt';
import {CreateUserDto, UserFullDto, UserInListDto} from "@studio-lite-lib/api-admin";
import {passwordHash} from "../../auth/auth.constants";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(): Promise<UserInListDto[]> {
    const users: User[] = await this.usersRepository.find();
    const returnUsers: UserInListDto[] = [];
    users.forEach(user => returnUsers.push(<UserInListDto>{
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin
    }));
    return returnUsers;
  }

  async findOne(id: number): Promise<UserFullDto> {
    const user = await this.usersRepository.findOne(id);
    return <UserFullDto>{
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      email: user.email
    }
  }

  async create(user: CreateUserDto): Promise<number> {
    user.password = UsersService.getPasswordHash(user.password);
    const newUser = await this.usersRepository.create(user);
    await this.usersRepository.save(newUser);
    return newUser.id;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<number | null> {
    const user = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.name = :name",
        {name: name})
      .getOne();
    if (user && bcrypt.compareSync(password, user.password)) {
      return user.id
    }
    return null
  }

  async getUserIsAdmin(id: number): Promise<boolean | null> {
    const user = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id",
        {id: id})
      .getOne();
    if (user) {
      return user.isAdmin
    }
    return null
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, passwordHash.salt);
  }
}
