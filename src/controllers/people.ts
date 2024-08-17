import { RequestHandler } from "express";
import * as people from '../services/people';
import z from 'zod';

export const getAll: RequestHandler = async (req, res) => {
    const { id_event, id_group } = req.params;
    console.log(req.params);
    const items = await people.getAll({
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (items) return res.status(200).json({ people: items });

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const getPerson: RequestHandler = async (req, res) => {
    const { id, id_event, id_group } = req.params;

    const personItem = await people.getOne({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (personItem) return res.status(200).json({ person: personItem });

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const addPerson: RequestHandler = async (req, res) => {
    const { id_event, id_group } = req.params;

    const addPersonSchema = z.object({
        name: z.string(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, ''))
    });

    const body = addPersonSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Dados Inválidos.' });

    const newPerson = await people.add({
        ...body.data,
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (newPerson) return res.status(201).json({ person: newPerson });

    res.status(500).json({ error: 'Ocorreu um erro.' });
};

export const updatePerson: RequestHandler = async (req, res) => {
    const { id, id_event, id_group } = req.params;

    const updatePersonSchema = z.object({
        name: z.string().optional(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, '')).optional(),
        matched: z.string().optional()
    });
    const body = updatePersonSchema.safeParse(req.body);

    if (!body.success) return res.status(400).json({ error: 'Dados Inválidos.' });

    const updatedPerson = await people.update({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    }, body.data);
    if (updatedPerson) {
        const personItem = await people.getOne({
            id: parseInt(id),
            id_event: parseInt(id_event),
            id_group: parseInt(id_group)
        });
        return res.json({ person: personItem });
    }

    res.status(500).json({ error: 'Ocorreu um erro.' });
};

export const deletePerson: RequestHandler = async (req, res) => {
    const { id, id_event, id_group } = req.params;

    const deletedPerson = await people.remove({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });
    if (deletedPerson) return res.status(204).json({ prson: deletedPerson });
    res.status(500).json({ error: 'Ocorreu um erro.' });
};