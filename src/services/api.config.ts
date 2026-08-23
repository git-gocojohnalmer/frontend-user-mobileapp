import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_BASE_URL = 'http://192.168.68.21:8081';

const normalizeBaseUrl = (value?: string) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmedValue.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

const TOKEN_STORAGE_KEY = '@flexpark_auth_token';

export const TokenStore = {
  async set(token: string | null) {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  async get() {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  },
};

type ApiFetchOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: unknown;
  withAuth?: boolean;
};

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  error: string;
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const { headers = {}, body, withAuth = false, ...rest } = options;

  const token = await TokenStore.get();
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (withAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error('Invalid response from server');
  }

  if (!response.ok || !payload.success) {
    const message = payload.success === false ? payload.error : 'Request failed';
    throw new Error(message);
  }

  return payload.data;
};
