type JsonObject = Record<string, unknown>;

type AimDefaultsInput<TMetadata> = {
  metadata?: TMetadata;
  interfaceLanguage?: string | null;
};

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * AIM: every new event type (created or duplicated, by any user) opens in the two-day booking
 * view and in English. A value already present wins, so a duplicate of an event type that
 * turned the view off keeps it off. Existing event types are not touched.
 */
export const withAimEventTypeDefaults = <TMetadata, T extends AimDefaultsInput<TMetadata>>(
  data: T
): T & { metadata: JsonObject; interfaceLanguage: string } => {
  const metadata = isJsonObject(data.metadata) ? data.metadata : {};
  return {
    ...data,
    metadata: { bookerTwoDayView: true, ...metadata },
    interfaceLanguage: data.interfaceLanguage || "en",
  };
};
