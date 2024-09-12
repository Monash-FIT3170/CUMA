
import express from "express";
const router = express.Router();

import { run } from '../../backend/webscraper.js';

router.post("/scrapeDomesticUnits", async (req, res) => {
    try {
      // Extract the source unit and comparison units from the request body
      const url = req.body.url;

      const output = await run(url);

      return res.json(output)
    } catch (error) {
      console.error(error);
      return res.status(500).json("Internal Server Error");
    }
});





export default router;