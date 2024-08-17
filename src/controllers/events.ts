import { RequestHandler } from "express";
import * as events from '../services/events';
import * as people from '../services/people';
import z from 'zod';

export const getAll: RequestHandler = async (req, res) => {
    const items = await events.getAll();
    if (items) return res.json({ events: items });

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const getEvent: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const eventItem = await events.getOne(parseInt(id));
    if (eventItem) return res.status(200).json({ event: eventItem });

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const addEvent: RequestHandler = async (req, res) => {
    const addEventSchema = z.object({
        title: z.string(),
        description: z.string(),
        grouped: z.boolean()
    });
    const body = addEventSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Dados inválidos.' });

    const newEvent = await events.add(body.data);
    if (newEvent) return res.status(201).json({ event: newEvent });

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const updateEvent: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const updateEventSchema = z.object({
        status: z.boolean().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        grouped: z.boolean().optional()
    });
    const body = updateEventSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Dados inválidos.' });

    const updatedEvent = await events.update(parseInt(id), body.data);
    if (updatedEvent) {
        if (updatedEvent.status) {
            const result = await events.doMatches(parseInt(id));
            if (!result) return res.status(400).json({ error: 'Grupos impossíveis de sortear.' });
        } else {
            await people.update({ id_event: parseInt(id) }, { matched: "" });
        }
        return res.status(200).json({ event: updatedEvent });
    }

    res.status(500).json({ error: 'Ocorreu um erro' });
};

export const deleteEvent: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const deletedEvent = await events.deleteEvent(parseInt(id));

    if (deletedEvent) return res.status(204).json({ event: deletedEvent }); //esse status não deveria retornar evento, mas vou deixar para fins didáticos.

    res.status(500).json({ error: 'Ocorreu um erro' });
};