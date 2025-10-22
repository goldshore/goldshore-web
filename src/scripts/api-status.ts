document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll<HTMLElement>('[data-api-status]');

  containers.forEach((container) => {
    const rows = container.querySelectorAll<HTMLElement>('[data-endpoint-row]');

    rows.forEach((row) => {
      const endpoint = row.dataset.endpoint;
      if (!endpoint) {
        return;
      }

      const expected = (row.dataset.expectedStatuses || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const dot = row.querySelector<HTMLElement>('[data-status-dot]');
      const statusText = row.querySelector<HTMLElement>('[data-status-text]');
      const message = row.querySelector<HTMLElement>('[data-status-message]');

      fetch(endpoint, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: 'application/json'
        }
      })
        .then(async (response) => {
          const responseStatus = response.status.toString();
          const isExpected = expected.length ? expected.includes(responseStatus) : response.ok;

          if (dot) {
            dot.classList.remove('bg-muted', 'bg-success', 'bg-warning', 'bg-error');
            dot.classList.add(isExpected ? 'bg-success' : response.ok ? 'bg-warning' : 'bg-error');
          }

          if (statusText) {
            statusText.textContent = isExpected
              ? `Expected ${response.status}`
              : `Unexpected ${response.status}`;
          }

          if (message) {
            const corsHeader = response.headers.get('access-control-allow-origin');
            const corsMessage = corsHeader ? ` CORS: ${corsHeader}` : ' CORS header missing.';
            message.textContent = `${response.status} ${response.statusText}.${corsMessage}`;
          }
        })
        .catch((error) => {
          if (dot) {
            dot.classList.remove('bg-muted', 'bg-success', 'bg-warning');
            dot.classList.add('bg-error');
          }

          if (statusText) {
            statusText.textContent = 'Offline';
          }

          if (message) {
            message.textContent = `Unable to reach API. ${error instanceof Error ? error.message : ''}`.trim();
          }
        });
    });
  });
});
