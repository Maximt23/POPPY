/**
 * POPPY API Key Manager
 * 
 * Securely manage API keys for different AI providers
 * - Encrypted local storage
 * - Per-project key assignment
 * - Key validation and testing
 * - Never expose keys in shared agents
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const POPPY_DIR = path.join(os.homedir(), '.poppy');
const API_KEYS_FILE = path.join(POPPY_DIR, 'api-keys.enc');
const ALGORITHM = 'aes-256-gcm';

// Derive a key from machine-specific data (basic encryption)
function getMachineKey() {
  const machineData = `${os.hostname()}-${os.userInfo().username}-${process.env.COMPUTERNAME || 'unknown'}`;
  return crypto.createHash('sha256').update(machineData).digest();
}

/**
 * Secure API Key Storage
 */
export class ApiKeyManager {
  constructor() {
    this.keys = {};
    this.providers = this.getProviders();
  }

  async init() {
    await fs.mkdir(POPPY_DIR, { recursive: true });
    await this.loadKeys();
  }

  /**
   * Get supported AI providers
   */
  getProviders() {
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4, GPT-3.5, DALL-E',
        keyPattern: /^sk-[a-zA-Z0-9]{48}$/,
        keyPrefix: 'sk-',
        models: [
          { id: 'gpt-4', name: 'GPT-4', context: '8K/32K' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: '128K' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: '16K' },
          { id: 'gpt-4o', name: 'GPT-4o', context: '128K' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: '128K' }
        ],
        baseUrl: 'https://api.openai.com/v1',
        docsUrl: 'https://platform.openai.com/api-keys'
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude 3.5, Claude 3',
        keyPattern: /^sk-ant-[a-zA-Z0-9_-]{100,}$/,
        keyPrefix: 'sk-ant-',
        models: [
          { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', context: '200K' },
          { id: 'claude-3-opus', name: 'Claude 3 Opus', context: '200K' },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', context: '200K' },
          { id: 'claude-3-haiku', name: 'Claude 3 Haiku', context: '200K' }
        ],
        baseUrl: 'https://api.anthropic.com/v1',
        docsUrl: 'https://console.anthropic.com/settings/keys'
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Gemini Pro, Gemini Ultra',
        keyPattern: /^AIzaSy[ a-zA-Z0-9_-]{35}$/,
        keyPrefix: 'AIzaSy',
        models: [
          { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', context: '1M' },
          { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', context: '1M' },
          { id: 'gemini-pro', name: 'Gemini Pro', context: '32K' },
          { id: 'gemini-ultra', name: 'Gemini Ultra', context: '32K' }
        ],
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        docsUrl: 'https://ai.google.dev/'
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'Ultra-fast LLM inference',
        keyPattern: /^gsk_[a-zA-Z0-9]{52}$/,
        keyPrefix: 'gsk_',
        models: [
          { id: 'llama-3-70b', name: 'LLaMA 3 70B', context: '8K' },
          { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', context: '32K' },
          { id: 'gemma-7b', name: 'Gemma 7B', context: '8K' }
        ],
        baseUrl: 'https://api.groq.com/openai/v1',
        docsUrl: 'https://console.groq.com/keys'
      },
      {
        id: 'azure',
        name: 'Azure OpenAI',
        description: 'Enterprise OpenAI on Azure',
        keyPattern: /^[a-f0-9]{32}$/,
        keyPrefix: '',
        models: [
          { id: 'gpt-4', name: 'GPT-4', context: '8K/32K' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: '128K' },
          { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', context: '16K' }
        ],
        requiresEndpoint: true,
        docsUrl: 'https://portal.azure.com/'
      },
      {
        id: 'cohere',
        name: 'Cohere',
        description: 'Command, Embed models',
        keyPattern: /^[a-zA-Z0-9]{40}$/,
        keyPrefix: '',
        models: [
          { id: 'command-r', name: 'Command R', context: '128K' },
          { id: 'command-r-plus', name: 'Command R+', context: '128K' },
          { id: 'command', name: 'Command', context: '4K' }
        ],
        baseUrl: 'https://api.cohere.com/v1',
        docsUrl: 'https://dashboard.cohere.com/api-keys'
      },
      {
        id: 'ollama',
        name: 'Ollama (Local)',
        description: 'Run models locally',
        keyPattern: /^local$/,
        keyPrefix: '',
        models: [
          { id: 'llama3', name: 'LLaMA 3', context: '8K' },
          { id: 'codellama', name: 'Code LLaMA', context: '16K' },
          { id: 'mistral', name: 'Mistral', context: '32K' },
          { id: 'mixtral', name: 'Mixtral', context: '32K' }
        ],
        baseUrl: 'http://localhost:11434',
        isLocal: true,
        docsUrl: 'https://ollama.com/'
      },
      {
        id: 'custom',
        name: 'Custom/OpenRouter',
        description: 'Custom endpoint or OpenRouter',
        keyPattern: /.*/,
        keyPrefix: '',
        models: [
          { id: 'custom', name: 'Custom Model', context: 'Varies' }
        ],
        requiresEndpoint: true,
        docsUrl: 'https://openrouter.ai/keys'
      }
    ];
  }

  /**
   * Load encrypted keys from disk
   */
  async loadKeys() {
    try {
      const encrypted = await fs.readFile(API_KEYS_FILE);
      const decipher = crypto.createDecipher(ALGORITHM, getMachineKey());
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      this.keys = JSON.parse(decrypted);
    } catch {
      this.keys = {};
    }
  }

  /**
   * Save encrypted keys to disk
   */
  async saveKeys() {
    const cipher = crypto.createCipher(ALGORITHM, getMachineKey());
    let encrypted = cipher.update(JSON.stringify(this.keys), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    await fs.writeFile(API_KEYS_FILE, encrypted);
  }

  /**
   * Store API key securely
   */
  async setKey(providerId, key, options = {}) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) throw new Error(`Unknown provider: ${providerId}`);

    // Validate key format
    if (provider.keyPattern && !provider.keyPattern.test(key)) {
      throw new Error(`Invalid API key format for ${provider.name}`);
    }

    this.keys[providerId] = {
      key: key,
      addedAt: new Date().toISOString(),
      defaultModel: options.defaultModel || provider.models[0]?.id,
      endpoint: options.endpoint || provider.baseUrl,
      customModels: options.customModels || []
    };

    await this.saveKeys();
    return { success: true };
  }

  /**
   * Get API key (masked)
   */
  getKey(providerId, reveal = false) {
    const keyData = this.keys[providerId];
    if (!keyData) return null;

    if (reveal) {
      return keyData.key;
    }

    // Return masked version
    return {
      provider: providerId,
      exists: true,
      masked: this.maskKey(keyData.key),
      defaultModel: keyData.defaultModel,
      addedAt: keyData.addedAt,
      endpoint: keyData.endpoint
    };
  }

  /**
   * Mask key for display
   */
  maskKey(key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  }

  /**
   * Get all configured keys (masked)
   */
  getAllKeys() {
    return Object.entries(this.keys).map(([providerId, data]) => ({
      provider: providerId,
      providerName: this.providers.find(p => p.id === providerId)?.name,
      masked: this.maskKey(data.key),
      defaultModel: data.defaultModel,
      addedAt: data.addedAt
    }));
  }

  /**
   * Remove API key
   */
  async removeKey(providerId) {
    delete this.keys[providerId];
    await this.saveKeys();
  }

  /**
   * Test API key
   */
  async testKey(providerId) {
    const keyData = this.keys[providerId];
    if (!keyData) return { valid: false, error: 'No key configured' };

    const provider = this.providers.find(p => p.id === providerId);
    
    try {
      // Provider-specific test
      switch (providerId) {
        case 'openai':
          return await this.testOpenAI(keyData.key);
        case 'anthropic':
          return await this.testAnthropic(keyData.key);
        case 'groq':
          return await this.testGroq(keyData.key);
        default:
          return { valid: true, message: 'Key format valid (live test not implemented)' };
      }
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  async testOpenAI(key) {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        message: `Key valid. ${data.data.length} models available.` 
      };
    }
    throw new Error(`API error: ${response.status}`);
  }

  async testAnthropic(key) {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      }
    });
    
    if (response.ok) {
      return { valid: true, message: 'Claude API key valid' };
    }
    throw new Error(`API error: ${response.status}`);
  }

  async testGroq(key) {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        message: `Key valid. ${data.data.length} models available.` 
      };
    }
    throw new Error(`API error: ${response.status}`);
  }

  /**
   * Set default model for provider
   */
  async setDefaultModel(providerId, modelId) {
    if (this.keys[providerId]) {
      this.keys[providerId].defaultModel = modelId;
      await this.saveKeys();
    }
  }

  /**
   * Get active model for an agent
   */
  getModelForAgent(agentId, preferredProvider) {
    // If agent specifies a preferred provider, use that
    if (preferredProvider && this.keys[preferredProvider]) {
      const keyData = this.keys[preferredProvider];
      return {
        provider: preferredProvider,
        model: keyData.defaultModel,
        key: keyData.key,
        endpoint: keyData.endpoint
      };
    }

    // Otherwise use first available key
    const [firstProvider, firstKey] = Object.entries(this.keys)[0] || [];
    if (firstProvider) {
      return {
        provider: firstProvider,
        model: firstKey.defaultModel,
        key: firstKey.key,
        endpoint: firstKey.endpoint
      };
    }

    return null;
  }
}

export default ApiKeyManager;
