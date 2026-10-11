import { createContext, useContext } from 'react';

type OtpContextValue = { value: string; maxLength: number; focused: boolean; disabled: boolean; invalid: boolean };
export const OtpContext = createContext<OtpContextValue | null>(null);

export function useOtp() {
  const ctx = useContext(OtpContext);
  if (!ctx) throw new Error('InputOTPSlot must be used within InputOTP');
  return ctx;
}
