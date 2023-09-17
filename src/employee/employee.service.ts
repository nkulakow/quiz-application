import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { EmployeeCreateDTO } from './dto/create-employee.input';
import { ProjectService } from 'src/project/project.service';
import { Project } from 'src/project/entities/project.entity';

@Injectable()
export class EmployeeService {
    
    constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>, 
    private projectService: ProjectService) {}
    
    async findAllEmployees():Promise<Employee[]>{
        return this.employeeRepository.find();
    }
    
    async createEmployee(employee:EmployeeCreateDTO):Promise<Employee>{
        let employeeToCreate = this.employeeRepository.create(employee);
        return this.employeeRepository.save(employeeToCreate);
    }
    
    
    async getProject(id:string): Promise<Project>|null {
        if (!id) {
            return null;
        }
        return this.projectService.findOne(id);
    }
}
