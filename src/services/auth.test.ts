import axios from "axios";
import {
  AuthHeaders,
  AuthResponse,
  SingleLayerStringMap,
  DeviceStorage
} from "../types";
import {
  deleteAuthHeaders,
  getUserAttributesFromResponse,
  persistAuthHeadersInDeviceStorage,
  setAuthHeaders
} from "./auth";

import AsyncLocalStorage from "../AsyncLocalStorage";

describe("auth service", () => {
  const headers: AuthHeaders = {
    "access-token": "accessToken",
    "token-type": "tokenType",
    client: "client",
    expiry: "expiry",
    uid: "uid"
  };

  describe("persistAndSetAuthHeaders", () => {
    it("sets the appropriate auth headers on the global axios config", () => {
      const Storage: DeviceStorage = AsyncLocalStorage;
      persistAuthHeadersInDeviceStorage(Storage, headers);
      // Timer to allow async set to happen
      setTimeout(() => {
        setAuthHeaders(Storage, headers);
        Object.keys(headers).forEach((key: string) => {
          expect(axios.defaults.headers.common[key]).toBe(headers[key]);
        });
      }, 1000);
    });
  });

  describe("deleteAuthHeaders", () => {
    it("deletes the appropriate auth headers from the global axios config", () => {
      deleteAuthHeaders();
      Object.keys(headers).forEach((key: string) => {
        expect(axios.defaults.headers.common["access-token"]).toBeUndefined();
      });
    });
  });

  describe("getUserAttributesFromResponse", () => {
    it("gets the values of the user attributes from the response, accounting for casing differences", () => {
      const userAttributes: SingleLayerStringMap = {
        firstName: "first_name",
        lastName: "last_name"
      };
      const authResponse: AuthResponse = {
        headers,
        data: {
          first_name: "Rick",
          last_name: "Sanchez"
        }
      };
      const result: SingleLayerStringMap = getUserAttributesFromResponse(
        userAttributes,
        authResponse
      );
      const expectedResult: SingleLayerStringMap = {
        firstName: "Rick",
        lastName: "Sanchez"
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
