import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
    
    @Post('add')
    addProduct(
    @Body('name') prodName: string,
    @Body('description') prodDesc: string, 
    @Body('price') prodPrice: number
    ): any {
        const generatedID = this.productsService.addProduct(prodName, prodDesc, prodPrice);
        return {id: generatedID}
    }
    
    
    @Get('all')
    getAllProducts() {
        return this.productsService.getAllProducts();
    }
    
    @Get('one/:id')
    getOneProduct(@Param('id') id: string) {
        return this.productsService.getOneProduct(id);
    }
    
    @Patch('update/:id')
    updateProduct(@Param('id') id: string, @Body('name') name: string, @Body('description') description: string, @Body('price') price: number) {
        this.productsService.updateProduct(id, name, description, price);
        return null;
    }
    
    @Delete('delete/:id')
    deleteProduct(@Param('id') id: string) {
        this.productsService.deleteProduct(id);
        return null;
    }
}
