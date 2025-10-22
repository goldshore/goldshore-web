document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#agentForm');
  const input = document.querySelector('#goal');
  const resultNode = document.querySelector('#result');

  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) || !(resultNode instanceof HTMLElement)) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const goal = input.value;
    resultNode.textContent = 'Planning…';
    try {
      const response = await fetch('https://api.goldshore.org/v1/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ goal })
      });
      const payload = await response.json();
      resultNode.textContent = JSON.stringify(payload, null, 2);
    } catch (error) {
      console.error(error);
      resultNode.textContent = `Request failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  });
});
