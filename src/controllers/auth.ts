import { RequestHandler } from "express"
import { z } from "zod";
import * as auth from '../services/auth';

export const login: RequestHandler = (req, res) => {
    //verificar senha
    const loginSchema = z.object({
        password: z.string({ required_error: 'Item obrigatório.', invalid_type_error: 'Dados inválidos.' })
    });
    const body = loginSchema.safeParse(req.body);
    if (!body.success) return res.json({ err: body.error });

    //validar senha e gerar token
    if (!auth.validatePassword(body.data.password)) {
        return res.status(401).json({ error: 'Acesso negado.' });
    }

    res.json({ token: auth.createToken() });
};

export const validate: RequestHandler = (req, res, next) => {
    if (!req.headers.authorization) return res.status(403).json({ error: 'Acesso negado.' });

    const token = req.headers.authorization.split(" ")[1];
    if (!auth.validateToken(token)) return res.status(403).json({ error: 'Acesso negado.' });

    next();
};