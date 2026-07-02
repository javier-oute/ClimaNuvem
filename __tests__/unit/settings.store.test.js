// Tests de settings.store.js (idioma, tema, consentimiento); hasMapPublishConsent garantiza re-pedir consentimiento al subir la versión.

jest.mock("react-native", () => ({
  Appearance: { setColorScheme: jest.fn() },
}));

import { Appearance } from "react-native";
import {
  useSettingsStore,
  hasMapPublishConsent,
  applyStoredTheme,
  CURRENT_MAP_CONSENT_VERSION,
} from "@/stores/settings.store";

// Estado inicial conocido antes de cada test (la store es un singleton de módulo).
beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({
    language: "gl",
    theme: "light",
    mapPublishConsentVersion: null,
  });
});

describe("defaults", () => {
  it("idioma por defecto gallego y tema claro", () => {
    const s = useSettingsStore.getState();
    expect(s.language).toBe("gl");
    expect(s.theme).toBe("light");
    expect(s.mapPublishConsentVersion).toBeNull();
  });
});

describe("setLanguage", () => {
  it("cambia el idioma", () => {
    useSettingsStore.getState().setLanguage("en");
    expect(useSettingsStore.getState().language).toBe("en");
  });
});

describe("setTheme", () => {
  it("aplica el esquema de color y guarda el tema (dark)", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(Appearance.setColorScheme).toHaveBeenCalledWith("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("'system' aplica null (sigue al SO)", () => {
    useSettingsStore.getState().setTheme("system");
    expect(Appearance.setColorScheme).toHaveBeenCalledWith(null);
    expect(useSettingsStore.getState().theme).toBe("system");
  });
});

describe("applyStoredTheme", () => {
  it("aplica el tema persistido al arrancar (light → 'light')", () => {
    useSettingsStore.setState({ theme: "light" });
    applyStoredTheme();
    expect(Appearance.setColorScheme).toHaveBeenCalledWith("light");
  });

  it("aplica null si el tema persistido es 'system'", () => {
    useSettingsStore.setState({ theme: "system" });
    applyStoredTheme();
    expect(Appearance.setColorScheme).toHaveBeenCalledWith(null);
  });
});

describe("consentimiento del mapa", () => {
  it("hasMapPublishConsent es false por defecto (null)", () => {
    expect(hasMapPublishConsent()).toBe(false);
  });

  it("true solo si la versión guardada == CURRENT_MAP_CONSENT_VERSION", () => {
    useSettingsStore
      .getState()
      .setMapPublishConsent(CURRENT_MAP_CONSENT_VERSION);
    expect(useSettingsStore.getState().mapPublishConsentVersion).toBe(
      CURRENT_MAP_CONSENT_VERSION,
    );
    expect(hasMapPublishConsent()).toBe(true);
  });

  it("una versión antigua NO cuenta como consentida (re-pide al subir versión)", () => {
    useSettingsStore
      .getState()
      .setMapPublishConsent(CURRENT_MAP_CONSENT_VERSION - 1);
    expect(hasMapPublishConsent()).toBe(false);
  });

  it("retirar el consentimiento con null", () => {
    useSettingsStore
      .getState()
      .setMapPublishConsent(CURRENT_MAP_CONSENT_VERSION);
    expect(hasMapPublishConsent()).toBe(true);

    useSettingsStore.getState().setMapPublishConsent(null);
    expect(hasMapPublishConsent()).toBe(false);
  });
});
