import { resolveApiUrl } from '../utils/api';

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
      const endpoint = form.getAttribute('data-endpoint') || resolveApiUrl('./agent/plan');
      const endpointUrl = new URL(endpoint, window.location.origin);
      const shouldIncludeCredentials =
        form.hasAttribute('data-include-credentials') || endpointUrl.origin === window.location.origin;

      const requestInit: RequestInit = {
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
