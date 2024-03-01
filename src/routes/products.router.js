import { Router } from "express";
import { ProductsController } from "../controller/products.controller.js";
import { isAdmin, isAdminPremium } from "../config/config.auten.autoriz.js";
export const router=Router();


router.post('/', isAdminPremium, ProductsController.createProduct);
router.put('/:pid', isAdminPremium, ProductsController.updateProduct);
router.delete('/:pid', isAdminPremium, ProductsController.deleteProduct);

