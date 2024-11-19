declare module 'react-native-speech-to-text' {
  export function startListening(): Promise<void>;
  export function stopListening(): Promise<void>;
  export function destroy(): Promise<void>;
  export function onSpeechResults(result: string): void;
  export function onSpeechError(error: { message: string }): void;
  export function removeAllListeners(): void;
}
