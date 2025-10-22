import { buildApiUrl } from '../lib/api';

const agentPlanEndpoint = buildApiUrl('/agent/plan');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector<HTMLFormElement>('#agentForm');
  const input = document.querySelector<HTMLInputElement>('#goal');
  const resultNode = document.querySelector<HTMLElement>('#result');

  if (!form || !input || !resultNode) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const goal = input.value;
    resultNode.textContent = 'Planning…';

    try {
      const response = await fetch(agentPlanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      };

      if (shouldIncludeCredentials) {
        requestInit.credentials = 'include';
      }

      const response = await fetch(endpoint, requestInit);

      const payload = await response.json();
      resultNode.textContent = JSON.stringify(payload, null, 2);
    } catch (error) {
      console.error(error);
      resultNode.textContent = `Request failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  });
});
