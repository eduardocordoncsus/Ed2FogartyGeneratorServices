import express from "express";
import { waveRequest } from "../services/waveService.js";
import { verifyFirebaseToken } from '../backend/middleware/auth.ts';

const router = express.Router();

router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const query = `
    query ($businessId: ID!, $page: Int!, $pageSize: Int!) {
      business(id: $businessId) {
        products(page: $page, pageSize: $pageSize) {
          edges {
            node {
              id
              name
              description
              unitPrice
            }
          }
        }
      }
    }`;

    const variables = {
      businessId: process.env.WAVE_BUSINESS_ID,
      page: 1,
      pageSize: 50
    };

    const data = await waveRequest(query, variables);
    
    const products = data.data.business.products.edges.map(edge => edge.node);
    
    res.json(products);

  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;