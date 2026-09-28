/**
 * swiggy.api.ts
 * All Swiggy-related API calls — OAuth connect + food/grocery data from the MCP backend.
 */

import api from './client';
import { Linking } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { sha256 } from 'js-sha256';
import base64 from 'base-64';

// ─── PKCE Helpers ──────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateCodeChallenge(verifier: string): string {
  const hashArray = sha256.array(verifier);
  const hashString = String.fromCharCode.apply(null, hashArray);
  return base64
    .encode(hashString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Start the Swiggy OAuth flow — generates PKCE pair and opens the browser */
export async function startSwiggyOAuth() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Store verifier so SwiggyCallbackScreen can retrieve it after the redirect
  useAppStore.getState().setSwiggyCodeVerifier(codeVerifier);

  const redirectUri = 'https://nexor-backend.onrender.com/api/swiggy/callback';

  const params = new URLSearchParams({
    client_id: 'nexor',
    redirect_uri: redirectUri,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'food instamart',
  });

  const authUrl = `https://mcp.swiggy.com/auth/authorize?${params.toString()}`;
  await Linking.openURL(authUrl);
}

/** Exchange authorization code for token */
export async function exchangeSwiggyToken(code: string, codeVerifier: string) {
  const res = await api.post('/swiggy/auth/token', { code, codeVerifier });
  return res.data;
}

/** Check if user has a linked Swiggy account */
export async function checkSwiggyConnection(): Promise<boolean> {
  try {
    // We try fetching addresses as a probe — 401 means not linked
    await api.get('/swiggy/food/addresses');
    return true;
  } catch (e: any) {
    if (e.response?.status === 401) return false;
    // Any other error (network, server) — assume possibly connected but errored
    return false;
  }
}

// ─── Food Delivery ─────────────────────────────────────────────────────────────

export async function getSwiggyAddresses() {
  const res = await api.get('/swiggy/food/addresses');
  return res.data;
}

export async function searchSwiggyRestaurants(addressId: string, query = '') {
  const res = await api.get('/swiggy/food/restaurants', {
    params: { addressId, query },
  });
  return res.data;
}

export async function getRestaurantMenu(restaurantId: string) {
  const res = await api.get(`/swiggy/food/restaurants/${restaurantId}/menu`);
  return res.data;
}

export async function getSwiggyCart() {
  const res = await api.get('/swiggy/food/cart');
  return res.data;
}

export async function updateSwiggyCart(
  restaurantId: string,
  items: { itemId: string; quantity: number }[],
) {
  const res = await api.post('/swiggy/food/cart', { restaurantId, items });
  return res.data;
}

export async function placeSwiggyOrder(paymentMethod = 'COD') {
  const res = await api.post('/swiggy/food/orders', { paymentMethod });
  return res.data;
}

export async function trackSwiggyOrder(orderId: string) {
  const res = await api.get(`/swiggy/food/orders/${orderId}/track`);
  return res.data;
}
