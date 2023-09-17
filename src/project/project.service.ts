import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private projectRepository: Repository<Project>,
  @InjectRepository(Employee) private employeeRepository: Repository<Employee>) {}
  
  
  async create(project: CreateProjectInput): Promise<Project> {
    let projectToCreate = this.projectRepository.create(project);
    return this.projectRepository.save(projectToCreate);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({relations: ['employees']});
  }

  async findOne(id: string): Promise<Project> {
    return this.projectRepository.findOne({where : {id: id},  relations: ["employees"] });
  }

  async update( updateProjectInput: UpdateProjectInput) {
    let updatedProject = this.findOne(updateProjectInput.id);
    if (!updatedProject) {
      throw new NotFoundException(`Project with id ${updateProjectInput.id} not found`);
    }
    let projectToUpdate = this.projectRepository.create(updateProjectInput);
    return this.projectRepository.save(projectToUpdate);
  }

  async remove(id: string) {
    let projectToRemove = this.findOne(id);
    if (projectToRemove) {
      await this.employeeRepository.update(
        { projectId: id }, // Find employees with the matching projectId
        { projectId: null } // Set projectId to null
      );
      let deleteValue = await this.projectRepository.delete(id);
      if (deleteValue.affected === 1) {
        return projectToRemove;
      }
      else {
        return null;
      } 
    }
      throw new NotFoundException(`Project with id ${id} not found`);
  }
}
