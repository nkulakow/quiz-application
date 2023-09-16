import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './employee.service';
import { EmployeeCreateDTO } from './dto/create-employee.input';

@Resolver()
export class EmployeeResolver {
    
    constructor(private employeeService:EmployeeService) {}
    
    @Query(()=>[Employee],{name:"findAllEmployees"})
    findAll() {
        return this.employeeService.findAll();
    }
    
    @Mutation(()=>Employee,{name:"createEmployee"})
    createEmployee(@Args('employee') employee:EmployeeCreateDTO) {
        return this.employeeService.createEmployee(employee);
    }
}
