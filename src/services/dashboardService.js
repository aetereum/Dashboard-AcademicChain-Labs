import { createApiClient } from "./apiClient.js";

export function buildDashboardService({ baseUrl, apiKey }) {
  const client = createApiClient({ baseUrl, apiKey });

  async function login(password) {
    const { data } = await client.post("/api/auth/login", { password });
    return data;
  }

  async function logout() {
    const { data } = await client.post("/api/auth/logout");
    return data;
  }

  async function getOverview() {
    const { data } = await client.get("/dashboard/overview");
    return data;
  }

  async function getInstitutions() {
    const { data } = await client.get("/partner/institutions");
    return data;
  }

  async function createInstitution(payload) {
    const { data } = await client.post("/partner/institutions", payload);
    return data;
  }

  async function getApiKeys() {
    const { data } = await client.get("/partner/api-keys");
    return data;
  }

  async function createApiKey(payload) {
    const { data } = await client.post("/partner/generate-key", payload);
    return data;
  }

  async function createApiKeyForInstitution(institutionId, payload) {
    // payload: { label, role, rateLimit, ... }
    const { data } = await client.post(`/partner/institutions/${institutionId}/generate-key`, payload);
    return data;
  }

  async function revokeApiKey(keyId) {
    const { data } = await client.delete(`/partner/api-keys/${keyId}`);
    return data;
  }

  async function getEmissions(params) {
    const { data } = await client.get("/partner/emissions", { params });
    return data;
  }

  async function verifyByCredentialId(credentialId) {
    const { data } = await client.get(`/v1/credentials/verify/${credentialId}`);
    return data;
  }

  async function verifyByTokenAndSerial({ tokenId, serialNumber }) {
    const { data } = await client.post("/partner/verify", {
      tokenId,
      serialNumber,
    });
    return data;
  }

  async function createInstitutionToken(payload) {
    // payload: { name, symbol, memo, ... }
    const { data } = await client.post("/partner/institution/create-token", payload);
    return data;
  }

  async function mintCredential(payload) {
    // payload: { institutionId, recipientDid, metadata, ... }
    const { data } = await client.post("/partner/institution/mint", payload);
    return data;
  }

  async function revokeCredential(payload) {
    // payload: { tokenId, serialNumber, reason }
    const { data } = await client.post("/v1/credentials/revoke", payload);
    return data;
  }

  async function getRevocations(params) {
    const { data } = await client.get("/v1/credentials/revocations", { params });
    return data;
  }

  async function getLogs() {
    const { data } = await client.get("/partner/logs");
    return data;
  }

  async function updateInstitutionCredits(id, amount) {
      // amount can be negative
      const { data } = await client.post(`/partner/institutions/${id}/credits`, { amount, action: 'add' });
      return data;
  }

  return {
    getOverview,
    getInstitutions,
    getApiKeys,
    createApiKey,
    createApiKeyForInstitution,
    revokeApiKey,
    getEmissions,
    verifyByCredentialId,
    verifyByTokenAndSerial,
    createInstitutionToken,
    mintCredential,
    revokeCredential,
    getRevocations,
    getLogs,
    updateInstitutionCredits,
    login,
    logout
  };
}
