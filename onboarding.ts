const WEIGHT_MAP: Record<string, number> = { oui: 2, parfois: 1.5, non: 1 };
const TECHNIQUES = ['autorite', 'peur', 'personnalisation', 'amorcage', 'tentation'] as const;

document.getElementById('save')!.addEventListener('click', async () => {
  const form = document.getElementById('onboarding-form') as HTMLFormElement;
  const data = new FormData(form);
  const weights: Record<string, number> = {};
  for (const technique of TECHNIQUES) {
    const answer = data.get(technique) as string | null;
    weights[technique] = answer ? (WEIGHT_MAP[answer] ?? 1) : 1;
  }
  await browser.storage.local.set({ techniqueWeights: weights });
  form.style.display = 'none';
  document.getElementById('confirmation')!.style.display = 'block';
});
