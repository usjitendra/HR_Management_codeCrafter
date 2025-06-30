import { Router } from "express";

const Terms=Router();

import {terms_add, delete_terms, terms_edit, allTerms} from "../controllers/term&conditions.controller.js";

Terms.post("/add", terms_add);
Terms.put("/update/:id", terms_edit);
Terms.delete("/delete/:id", delete_terms);
Terms.get("/all", allTerms);


export default Terms;
