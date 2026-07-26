declare module "web-push" {
  interface PushSubscription {
    endpoint: string;
    expirationTime?: number | null;
    keys?: {
      p256dh: string;
      auth: string;
    };
  }

  interface VapidDetails {
    subject: string;
    publicKey: string;
    privateKey: string;
  }

  interface SendNotificationOptions {
    TTL?: number;
    urgency?: string;
    topic?: string;
  }

  function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: SendNotificationOptions
  ): Promise<void>;

  function generateVapidKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export { setVapidDetails, sendNotification, generateVapidKeys };
}
