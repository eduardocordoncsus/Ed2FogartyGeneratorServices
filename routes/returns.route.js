import express from "express";
import returns from '../models/returns.model.js';
import {
    getReturn, 
    getPendingReturnCount,
    createReturn, 
    updateReturn, 
    deleteReturn
} from '../controller/returns.controller.js';
import { verifyFirebaseToken } from '../backend/middleware/auth.ts';

const router = express.Router();

router.get('/', verifyFirebaseToken, getReturn);
router.get("/pending-returns", getPendingReturnCount); 
router.post("/", createReturn);
router.put("/:id", updateReturn);
router.delete("/:id", deleteReturn);

export default router;