import { PLAN_LIMITS } from './SubscriptionLimits.js';

export function getUserPlan(user) {
  const plan = user.subscription?.plan || 'NEOPHYTE';
  const status = user.subscription?.status;

  const isActive = status === 'active' || status === 'pending_cancellation' || status === 'processing';

  if (!isActive || !PLAN_LIMITS[plan]) {
    return {
      plan: 'NEOPHYTE',
      limits: PLAN_LIMITS['NEOPHYTE']
    };
  }

  return {
    plan,
    limits: PLAN_LIMITS[plan]
  };
}
