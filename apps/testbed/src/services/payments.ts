import { CHALLENGE_CODE, TEST_CARDS } from '../mocks/cards';
import { digitsOf, type CardInput } from '../payment/card';

export type PaymentResult =
  | { status: 'succeeded'; orderNumber: string }
  | { status: 'requires-action'; challengeId: string }
  | { status: 'failed'; reason: 'declined' | 'insufficient-funds' };

export type ChallengeResult =
  | { status: 'succeeded'; orderNumber: string }
  | { status: 'wrong-code'; attemptsLeft: number }
  | { status: 'failed'; reason: 'challenge-failed' };

const MAX_ATTEMPTS = 3;
const attempts = new Map<string, number>();
const wait = () => new Promise((resolve) => setTimeout(resolve, 400));
const newOrderNumber = () => `FO-${String(Math.floor(100000 + Math.random() * 900000))}`;

/** Paiement simulé : le résultat dépend de la carte de test (voir mocks/cards.ts). */
export async function pay(reservation: string, card: CardInput): Promise<PaymentResult> {
  await wait();
  switch (digitsOf(card.number)) {
    case digitsOf(TEST_CARDS.challenge): {
      const challengeId = `${reservation}-3ds`;
      attempts.set(challengeId, 0);
      return { status: 'requires-action', challengeId };
    }
    case digitsOf(TEST_CARDS.declined):
      return { status: 'failed', reason: 'declined' };
    case digitsOf(TEST_CARDS.insufficientFunds):
      return { status: 'failed', reason: 'insufficient-funds' };
    default:
      return { status: 'succeeded', orderNumber: newOrderNumber() };
  }
}

/** Validation 3-D Secure simulée : trois tentatives. */
export async function confirmChallenge(
  challengeId: string,
  code: string
): Promise<ChallengeResult> {
  await wait();
  if (code.trim() === CHALLENGE_CODE) {
    attempts.delete(challengeId);
    return { status: 'succeeded', orderNumber: newOrderNumber() };
  }
  const used = (attempts.get(challengeId) ?? 0) + 1;
  attempts.set(challengeId, used);
  if (used >= MAX_ATTEMPTS) {
    attempts.delete(challengeId);
    return { status: 'failed', reason: 'challenge-failed' };
  }
  return { status: 'wrong-code', attemptsLeft: MAX_ATTEMPTS - used };
}
