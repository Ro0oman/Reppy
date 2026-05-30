export const PUSH_ELIGIBLE_KEY = 'reppy_push_eligible_after_training';

export const markPushPromptEligible = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUSH_ELIGIBLE_KEY, '1');
  window.dispatchEvent(new CustomEvent('reppy-push-eligible'));
};

export const isPushPromptEligible = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PUSH_ELIGIBLE_KEY) === '1';
};
