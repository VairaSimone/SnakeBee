import { PLAN_LIMITS } from './SubscriptionLimits.js';

export function getUserPlan(user) {
  const plan = user.subscription?.plan || 'free';
  const status = user.subscription?.status;

  const isActive = status === 'active' || status === 'pending_cancellation' || status === 'processing';

  if (!isActive || !PLAN_LIMITS[plan]) {
    return {
      plan: 'free',
      limits: PLAN_LIMITS['free']
    };
  }

  return {
    plan,
    limits: PLAN_LIMITS[plan]
  };
}
