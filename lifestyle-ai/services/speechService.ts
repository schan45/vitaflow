export type SpeechConfig = {
  key?: string;
  region?: string;
};

export function getSpeechConfig(): SpeechConfig {
  return {
    key: process.env.AZURE_SPEECH_KEY,
    region: process.env.AZURE_SPEECH_REGION,
  };
}
