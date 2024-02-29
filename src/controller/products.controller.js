import validUrl from 'valid-url'
import { ProductsService } from '../repository/products.service.js';
const productsService = new ProductsService();

export class ProductsController{
    constructor(){}

    static async getProducts(req, res) {
        try {
            let category = req.query.category;
            let query = {};
    
            if (category) {
                query.category = category;
            }
    
            const products = await productsService.getProducts(query);
    
            res.setHeader('Content-Type', 'text/html');
            res.status(200).render('home', {
                products: products,
                login: req.session.usuario ? true : false,
                currentCategory: category, 
            });
    
        } catch (error) {
            req.logger.error('Error al obtener los productos');
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    }

    static async createProduct(req,res){

        try {
            const usuario = req.session.usuario;
            const newProductData = req.body;
            const requiredFields = ['title', 'description', 'price', 'thumbnails', 'code', 'stock', 'category'];
    
            for (const field of requiredFields) {
                if (!newProductData[field]) {
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(400).json({ error: `El campo '${field}' es obligatorio.` });
                }
            }
    
            // Validar URLs de imágenes
            const validThumbnails = newProductData.thumbnails.every(url => validUrl.isUri(url));
    
            if (!validThumbnails) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'La URL de la imagen no es válida.' });
            }
            const existingProduct = await productsService.getProductByCode(newProductData.code);
            

            if (existingProduct) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Ya existe un producto con el código '${newProductData.code}'.` });
            }
            
    
            await productsService.createProduct(newProductData);
            req.logger.info(`Se creo el producto: ${newProductData.title}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({ success: true, message: 'Producto agregado correctamente.', newProductData });
        } catch (error) {
            req.logger.error('Error al agregar el producto');
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: 'Error al agregar el producto.' });
        }
    }
        static async updateProduct (req,res){
        try {
            const productId = req.params.pid;
    
            // Buscar el producto existente por _id
            const existingProduct = await productsService.getProductById(productId)
    
            if (!existingProduct) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
    
            // Verificar si la propiedad _id está presente en el cuerpo de la solicitud
            if ('_id' in req.body) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'No se puede modificar la propiedad _id.' });
            }
    
            // Actualizar el producto utilizando findByIdAndUpdate
            const updateResult = await productsService.update(productId, req.body);
    
            if (updateResult) {
                req.logger.info(`Producto actualizado: ${productId}`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ success: true, message: 'Modificación realizada.' });
            } else {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'No se concretó la modificación.' });
            }
        } catch (error) {
            req.logger.error('Error al actualizar el producto');
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: 'Error al actualizar el producto.' });
        }
    }

    static async deleteProduct (req,res){
        try {
            const productId = req.params.pid;
            const usuario =req.session.usuario
            // Buscar el producto existente por _id
            const existingProduct = await productsService.getProductById(productId)
    
            if (!existingProduct) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
    
            // Actualizar el producto utilizando findByIdAndUpdate
            const updateResult = await productsService.delete(productId);
    
            if (updateResult) {
                req.logger.info(`Producto eliminado: ${productId}`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ success: true, message: 'Producto Eliminado' });
            } else {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'No se puedo eliminar el producto' });
            }
        } catch (error) {
            req.logger.error(`Error al eliminar el producto ${error}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: 'Error al eliminar el producto.' });
        }
    }
};