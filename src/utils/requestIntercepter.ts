import { RequestHandler } from "express";

export const requestIntercepter: RequestHandler = (req, res, next) => {
    //console.log("-> GET /admin/events/123?q=true {password: 123123}");
    console.log(`-> ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)} `);
    next();
};