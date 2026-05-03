import express from "express";
import Generator from '../models/generator.model.js';
const router = express.Router();
import {getGens, getGen, createGen, updateGen, deleteGen} from '../controller/generator.controller.js';
import { verifyFirebaseToken } from '../backend/middleware/auth.ts';




router.get('/', verifyFirebaseToken, getGens);

router.get("/:id",getGen);

router.post("/", createGen);

router.put("/:id", updateGen);

router.delete("/:id", deleteGen);

export default router;