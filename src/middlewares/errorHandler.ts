import { Response } from 'express';

export function handleError(error: any, res: Response) {
  console.error(error);
  return res.status(500).json({ error: 'Internal Server Error' });
}
