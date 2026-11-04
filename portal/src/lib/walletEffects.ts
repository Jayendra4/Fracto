export type WalletEffect =
  | { type: 'DEBIT'; amount: number }
  | { type: 'CREDIT'; amount: number };

export function triggerWalletEffect(effect: WalletEffect) {
  window.dispatchEvent(new CustomEvent('wallet-effect', { detail: effect }));
}
