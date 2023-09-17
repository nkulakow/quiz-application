import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './employee.service';
import { EmployeeCreateDTO } from './dto/create-employee.input';
import { Project } from 'src/project/entities/project.entity';

@Resolver(() => Employee)
export class EmployeeResolver {
    
    constructor(private employeeService:EmployeeService) {}
    
    @Query(()=>[Employee],{name:"findAllEmployees"})
    findAllEmployees() {
        return this.employeeService.findAllEmployees();
    }
    
    @Mutation(()=>Employee,{name:"createEmployee"})
    createEmployee(@Args('employee') employee:EmployeeCreateDTO) {
        return this.employeeService.createEmployee(employee);
    }
    
    @ResolveField(()=>Project)
    Project(@Parent() employee:Employee) {
        return this.employeeService.getProject(employee.projectId);
    }
}
