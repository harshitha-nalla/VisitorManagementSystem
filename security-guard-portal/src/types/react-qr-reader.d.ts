declare module 'react-qr-reader' {
  import { CSSProperties } from 'react';

  interface QrReaderProps {
    onResult?: (result: { text: string } | null) => void;
    constraints?: MediaTrackConstraints;
    videoStyle?: CSSProperties;
    containerStyle?: CSSProperties;
    videoContainerStyle?: CSSProperties;
  }

  export const QrReader: React.FC<QrReaderProps>;
} 