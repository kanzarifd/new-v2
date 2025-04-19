import { Router } from "express";
import { searchReclamations } from "../controllers/searchController";

const router = Router();

router.get("/", searchReclamations);

export default router;
