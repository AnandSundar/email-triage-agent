import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { Email } from '../types';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
];

const TOKEN_PATH = path.join(process.cwd(), 'backend', 'token.json');

class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  private credentialsPath: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }

    this.credentialsPath = path.join(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH || 'credentials.json');
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.FRONTEND_URL || 'http://localhost:5173'
    );
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async authenticate(): Promise<boolean> {
    const tokenPathFull = TOKEN_PATH;

    // Check if token exists
    if (fs.existsSync(tokenPathFull)) {
      const token = JSON.parse(fs.readFileSync(tokenPathFull, 'utf-8'));
      this.oauth2Client.setCredentials(token);

      // Check if token is expired and refresh if needed
      if (token.expiry_date && token.expiry_date < Date.now()) {
        try {
          await this.oauth2Client.refreshAccessToken();
          this.saveToken(tokenPathFull);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          return false;
        }
      }
      return true;
    }

    // Need to get new token via OAuth flow
    console.log('No token found. Please authorize the app by visiting the auth URL.');
    return false;
  }

  private saveToken(tokenPath: string): void {
    const credentials = this.oauth2Client.credentials;
    fs.writeFileSync(tokenPath, JSON.stringify(credentials));
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
  }

  async getTokenFromCode(code: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      this.saveToken(TOKEN_PATH);
      return true;
    } catch (error) {
      console.error('Error getting token from code:', error);
      return false;
    }
  }

  async fetchUnreadEmails(maxResults: number = 20): Promise<Email[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX', 'UNREAD'],
        maxResults,
      });

      const messages = response.data.messages || [];
      const emails: Email[] = [];

      for (const msg of messages) {
        try {
          const fullMsg = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const email = this.parseMessage(fullMsg.data);
          if (email) {
            emails.push(email);
          }
        } catch (msgError) {
          console.error(`Error fetching message ${msg.id}:`, msgError);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
    }
  }

  async createDraft(to: string, subject: string, body: string, threadId?: string): Promise<string> {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const draft = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedMessage,
            threadId,
          },
        },
      });

      return draft.data.id || '';
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }

  private parseMessage(msg: gmail_v1.Schema$Message): Email | null {
    try {
      const headers = msg.payload?.headers || [];
      const headerMap = new Map(headers.map(h => [h.name?.toLowerCase(), h.value]));

      const from = headerMap.get('from') || '';
      const to = headerMap.get('to') || '';
      const subject = headerMap.get('subject') || '';
      const date = headerMap.get('date') || '';

      // Parse sender
      let sender = from;
      let senderName = '';
      const emailMatch = from.match(/<(.+)>/);
      if (emailMatch) {
        senderName = from.replace(/<.+>/, '').trim().replace(/^"|"$/g, '');
        sender = emailMatch[1];
      }

      // Extract body
      let body = '';
      if (msg.payload?.parts) {
        for (const part of msg.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            break;
          }
        }
      } else if (msg.payload?.body?.data) {
        body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
      }

      // Strip HTML if present
      if (body.includes('<') && body.includes('>')) {
        body = body.replace(/<[^>]*>/g, '');
      }

      // Truncate body
      if (body.length > 4000) {
        body = body.substring(0, 4000);
      }

      const snippet = msg.snippet || body.substring(0, 200);

      return {
        id: msg.id || '',
        thread_id: msg.threadId || '',
        sender,
        sender_name: senderName,
        subject,
        body,
        snippet,
        timestamp: new Date(date).toISOString(),
        priority: 'normal',
        intent: 'other',
        priority_emoji: '🟡',
        auto_reply_eligible: false,
        requires_human_review: false,
        review_reason: undefined,
        status: 'new',
        labels: msg.labelIds || [],
        suggested_action: undefined,
        draft_id: undefined,
      };
    } catch (error) {
      console.error('Error parsing message:', error);
      return null;
    }
  }
}

export const gmailService = new GmailService();
export { GmailService };
