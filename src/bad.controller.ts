import { Request, Response } from 'express';
import mongoose from 'mongoose';

// 🚨 ANTI-PATTERN 1: God Class / Mixing Concerns
// 🚨 ANTI-PATTERN 2: Direct Database Access from Controller (Bypassing Service/Domain Layer)
// 🚨 ANTI-PATTERN 3: Hardcoded Credentials
// 🚨 ANTI-PATTERN 4: SQL Injection Vulnerability (if this was SQL, but here it's NoSQL Injection)

export class BadController {
  public async getSuperSecretDataAndProcessIt(req: Request, res: Response) {
    try {
      // BAD: Hardcoded secrets in code!
      const API_KEY = 'sk_live_1234567890abcdef';
      const DB_PASS = 'admin123';

      // BAD: Controller shouldn't know about mongoose connection strings!
      await mongoose.connect(`mongodb://admin:${DB_PASS}@localhost:27017/prod_db`);

      // BAD: Direct database querying inside a controller
      const db = mongoose.connection;
      const usersCollection = db.collection('users');

      // BAD: Taking raw request body and dumping it into DB query (NoSQL Injection risk)
      const userData = await usersCollection.find(req.body).toArray();

      // BAD: Controller doing heavy business logic
      for (let i = 0; i < userData.length; i++) {
        userData[i].creditScore = Math.random() * 800;
        userData[i].apiKey = API_KEY;
      }

      return res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error) {
      // BAD: Leaking raw error stack traces to the client
      return res.status(500).send(error);
    }
  }
}
