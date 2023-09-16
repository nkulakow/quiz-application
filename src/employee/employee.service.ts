import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { EmployeeCreateDTO } from './dto/create-employee.input';

@Injectable()
export class EmployeeService {
    
    constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>) {}
    
    async findAll():Promise<Employee[]>{
        return this.employeeRepository.find();
    }
    
    async createEmployee(employee:EmployeeCreateDTO):Promise<Employee>{
        let employeeToCreate = this.employeeRepository.create(employee);
        return this.employeeRepository.save(employeeToCreate);
    }
    
}
