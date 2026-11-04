import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private isInitialized = false;

  onModuleInit() {
    if (!admin.apps.length) {
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
          this.isInitialized = true;
          this.logger.log('Firebase Admin initialized successfully');
        } catch (error: any) {
          this.logger.warn(`Firebase Admin initialization failed: ${error.message}`);
        }
      } else {
        this.logger.warn(
          'Firebase credentials not provided in .env. Push notifications disabled for local development.',
        );
      }
    } else {
      this.isInitialized = true;
    }
  }

  get admin() {
    return admin;
  }

  async sendToDeviceTokens(tokens: string[], payload: any) {
    if (!this.isInitialized || !tokens || !tokens.length) return null;

    const chunkSize = 500;
    const results = [];

    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const msg = { ...payload, tokens: chunk };
      const resp = await admin.messaging().sendEachForMulticast(msg);
      results.push(resp);
    }

    return results;
  }
}
