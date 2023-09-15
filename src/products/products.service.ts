import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.model';
import { get } from 'http';


@Injectable()
export class ProductsService {
    products: Product[] = [];
    
    addProduct(name: string, desc: string, price: number) {
        const prodId = new Date().toString().split('(')[0].replace(/ /g, '');
        const newProduct = new Product(prodId, name, desc, price);
        this.products.push(newProduct);
        return prodId;
    }
    
    getAllProducts() {
        return [...this.products];
    }
        
    getOneProduct(id: string) {
        const product = this.findProduct(id)[0];
        return {...product};
    }
    
    updateProduct(id: string, name: string, description: string, price: number) {
        const [product, index] = this.findProduct(id);
        const updatedProduct = {...product};
        if (name) {
            updatedProduct.name = name;
        }
        if (description) {
            updatedProduct.description = description;
        }
        if (price) {
            updatedProduct.price = price;
        }
        else {
            throw new NotFoundException('Could not find price');
        }
        this.products[index] = updatedProduct;
       
    }
    
    deleteProduct(id: string) {
        const index = this.findProduct(id)[1];
        this.products.splice(index, 1);
    }
    
    private findProduct(id: string): [Product, number] {
        const index = this.products.findIndex((prod) => prod.id === id);
        const product = this.products[index];
        if (!product) {
            throw new NotFoundException('Could not find product');
        }
        return [product, index];
    }
    

}