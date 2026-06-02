const form = document.getElementById('onboarding-form') as HTMLFormElement;
const confirmation = document.getElementById('confirmation') as HTMLDivElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const keys = ['autorite', 'peur', 'personnalisation', 'amorcage', 'tentation'];
  const weights: Record<string, number> = {};
  for (const key of keys) weights[key] = parseFloat(data.get(key) as string) || 1.0;
  await browser.storage.local.set({ techniqueWeights: weights });
  form.style.display = 'none';
  confirmation.style.display = 'block';
});
