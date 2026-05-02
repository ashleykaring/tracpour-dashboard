import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import { EVENT_TYPES } from './domain';
import { ingestEvent } from './services/events';
import {
  completePour,
  computeDashboardSummary,
  createPour,
  getActivePourRecord,
  listActivityForPour,
  listLoadsForPour,
  listTicketsForPour,
} from './services/pours';
import { attachRecentUnassignedTicketsToPour, createOrUpdateTicket } from './services/tickets';
import {
  serializeActivityEvent,
  serializeLoad,
  serializePour,
  serializeTruckingTicket,
} from './serializers';

const startPourSchema = z.object({
  name: z.string().trim().min(1),
  expectedYardage: z.number().positive(),
  startedAt: z.string().datetime().optional(),
});

const ingestEventSchema = z.object({
  type: z.enum(EVENT_TYPES),
  timestamp: z.string().datetime().optional(),
});

const optionalText = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.string().trim().min(1).optional()
);

const optionalNumber = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.coerce.number().positive().optional()
);

const createTicketSchema = z
  .object({
    jobId: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.string().uuid().optional()
    ),
    ticketNumber: optionalText,
    downloadUrl: optionalText,
    truckLabel: optionalText,
    deliveredAt: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.string().datetime().optional()
    ),
    yardage: optionalNumber,
    status: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.enum(['available', 'pending']).optional()
    ),
  })
  .refine((input) => input.ticketNumber || input.downloadUrl, {
    message: 'Provide at least a ticketNumber or downloadUrl.',
    path: ['ticketNumber'],
  });

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/api/pours/active', async () => {
    const activePour = await getActivePourRecord();
    return activePour ? serializePour(activePour) : null;
  });

  app.post('/api/pours/start', async (request, reply) => {
    const input = parseBody(startPourSchema, request.body, reply);

    if (!input) {
      return;
    }

    const existingActivePour = await getActivePourRecord();

    if (existingActivePour) {
      return reply.code(409).send({
        error: 'ACTIVE_POUR_EXISTS',
        message: 'Complete the active pour before starting another one.',
        activePour: serializePour(existingActivePour),
      });
    }

    const pour = await createPour({
      name: input.name,
      expectedYardage: input.expectedYardage,
      startedAt: input.startedAt,
    });
    await attachRecentUnassignedTicketsToPour(pour.id);

    return reply.code(201).send(serializePour(pour));
  });

  app.post('/api/pours/active/complete', async (_request, reply) => {
    const activePour = await getActivePourRecord();

    if (!activePour) {
      return reply.code(404).send({
        error: 'NO_ACTIVE_POUR',
        message: 'There is no active pour to complete.',
      });
    }

    const completedPour = await completePour(activePour.id);

    return serializePour(completedPour);
  });

  app.get('/api/pours/active/loads', async () => {
    const activePour = await getActivePourRecord();

    if (!activePour) {
      return [];
    }

    const loads = await listLoadsForPour(activePour.id);

    return loads.map(serializeLoad);
  });

  app.get('/api/pours/active/activity', async () => {
    const activePour = await getActivePourRecord();

    if (!activePour) {
      return [];
    }

    const activityEvents = await listActivityForPour(activePour.id);

    return activityEvents.map(serializeActivityEvent);
  });

  app.get('/api/pours/active/tickets', async () => {
    const activePour = await getActivePourRecord();

    if (!activePour) {
      return [];
    }

    const tickets = await listTicketsForPour(activePour.id);

    return tickets.map(serializeTruckingTicket);
  });

  app.get('/api/pours/active/summary', async () => {
    const activePour = await getActivePourRecord();

    if (!activePour) {
      return null;
    }

    return computeDashboardSummary(activePour);
  });

  app.post('/api/events', async (request, reply) => {
    const input = parseBody(ingestEventSchema, request.body, reply);

    if (!input) {
      return;
    }

    return reply.code(202).send(await ingestEvent(input));
  });

  app.post('/api/tickets', async (request, reply) => {
    const input = parseBody(createTicketSchema, request.body, reply);

    if (!input) {
      return;
    }

    const result = await createOrUpdateTicket(input);

    if (!result) {
      return reply.code(404).send({
        error: 'POUR_NOT_FOUND',
        message: 'No pour exists with that jobId.',
      });
    }

    return reply.code(result.created ? 201 : 200).send(serializeTruckingTicket(result.ticket));
  });
}

function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown,
  reply: FastifyReply
): z.infer<T> | null {
  const result = schema.safeParse(body);

  if (!result.success) {
    reply.code(400).send({
      error: 'VALIDATION_ERROR',
      details: result.error.flatten(),
    });
    return null;
  }

  return result.data;
}
