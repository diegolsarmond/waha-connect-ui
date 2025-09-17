import { WAHAConfig, ChatOverview, Message, SendTextRequest, WAHAResponse, SessionStatus } from '@/types/waha';

class WAHAService {
  private config: WAHAConfig;

  constructor() {
    // WAHA API Configuration
    this.config = {
      baseUrl: 'https://waha.quantumtecnologia.com.br',
      apiKey: '4YF9gDywbivQWAP_JpGZsGTVgVz3gP55T1hXbYAg8y8',
      session: 'QuantumTecnologia01'
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<WAHAResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Api-Key': this.config.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('WAHA API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500 
      };
    }
  }

  // Get session status
  async getSessionStatus(): Promise<WAHAResponse<SessionStatus>> {
    return this.makeRequest<SessionStatus>(`/api/sessions/${this.config.session}`);
  }

  // Get chats overview
  async getChatsOverview(limit = 50, offset = 0): Promise<WAHAResponse<ChatOverview[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    return this.makeRequest<ChatOverview[]>(`/api/${this.config.session}/chats/overview?${params}`);
  }

  // Get messages from a chat
  async getChatMessages(
    chatId: string, 
    options: {
      limit?: number;
      offset?: number;
      downloadMedia?: boolean;
    } = {}
  ): Promise<WAHAResponse<Message[]>> {
    const params = new URLSearchParams({
      limit: (options.limit || 50).toString(),
      offset: (options.offset || 0).toString(),
      downloadMedia: (options.downloadMedia || false).toString(),
    });
    
    return this.makeRequest<Message[]>(`/api/${this.config.session}/chats/${chatId}/messages?${params}`);
  }

  // Send text message
  async sendTextMessage(request: Omit<SendTextRequest, 'session'>): Promise<WAHAResponse<Message>> {
    const payload: SendTextRequest = {
      ...request,
      session: this.config.session,
    };

    return this.makeRequest<Message>('/api/sendText', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Mark messages as read
  async markAsRead(chatId: string, messages = 30): Promise<WAHAResponse<void>> {
    const params = new URLSearchParams({
      messages: messages.toString(),
    });
    
    return this.makeRequest<void>(`/api/${this.config.session}/chats/${chatId}/messages/read?${params}`, {
      method: 'POST',
    });
  }

  // Get chat info
  async getChatInfo(chatId: string): Promise<WAHAResponse<any>> {
    return this.makeRequest(`/api/${this.config.session}/chats/${chatId}`);
  }

  // Get QR Code for authentication (if needed)
  async getQRCode(): Promise<WAHAResponse<{ mimetype: string; data: string }>> {
    return this.makeRequest(`/api/${this.config.session}/auth/qr?format=image`);
  }

  // Utility method to format phone number to WhatsApp ID
  static formatPhoneToWhatsAppId(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Add @c.us suffix for individual chats
    return `${cleaned}@c.us`;
  }

  // Utility method to extract phone number from WhatsApp ID
  static extractPhoneFromWhatsAppId(whatsappId: string): string {
    return whatsappId.replace('@c.us', '').replace('@g.us', '');
  }

  // Get webhook URL that should be configured in WAHA
  getWebhookUrl(baseUrl: string): string {
    return `${baseUrl}/api/webhook/waha`;
  }
}

export const wahaService = new WAHAService();
export default WAHAService;