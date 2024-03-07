export const MagicLinkVerification = {
  success: Success,
  failure: Failure,
}

export function Success() {
  return <p>magic link verified.</p>
}

export function Failure() {
  return <p>Magic link verification failure.</p>
}
