const express = require("express");

const ProductsServive = require("../services/product.service");
const { validatorHandler } = require("../middlewares/validator.handler");
const { createProductSchema, updateProductSchema, getProductSchema } = require("../schemas/product.schema");

const router = express.Router();
const service = new ProductsServive();

router.get("/", async (req, res) => {
  const products = await service.find();
  res.json(products);
});

router.get("/filter", async (req, res) => {
  const { id } = req.params;

  res.json({ id, name: "name", price: 5000 });
});

router.get(
  "/:id",
  validatorHandler(getProductSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await service.findOne(id);
    
      res.status(200).json(product);    
    } catch (error) {
      next(error);
    }
});

router.post(
  "/",
  validatorHandler(createProductSchema, "body"),
  async (req, res) => {
    const data = req.body;
    const newProduct = await service.create(data);

    res.status(201).json(newProduct);
});

router.patch(
  "/:id",
  validatorHandler(getProductSchema, "params"),
  validatorHandler(updateProductSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const product = await service.update(id, data);
    
      res.json(product);
    } catch (error) {
      next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await service.delete(id);
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;