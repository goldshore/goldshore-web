document.addEventListener('DOMContentLoaded', () => {
  const status = document.querySelector<HTMLElement>('#admin-status');
  const actionable = document.querySelectorAll<HTMLElement>('[data-endpoint][data-method]');

  actionable.forEach((element) => {
    element.addEventListener('click', async () => {
      if (!status) {
        return;
      }

      const endpoint = element.getAttribute('data-endpoint');
      const method = (element.getAttribute('data-method') || 'GET').toUpperCase();
      const payload = element.getAttribute('data-payload');

      if (!endpoint) {
        return;
      }

      status.textContent = `Running ${method} request to ${endpoint}…`;

      try {
        const endpointUrl = new URL(endpoint, window.location.origin);
        const shouldIncludeCredentials =
          element.hasAttribute('data-include-credentials') || endpointUrl.origin === window.location.origin;

        const requestInit: RequestInit = {
          method,
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
          body: method === 'POST' ? payload || JSON.stringify({}) : undefined
        };

        if (shouldIncludeCredentials) {
          requestInit.credentials = 'include';
        }

        const response = await fetch(endpoint, requestInit);

        const text = await response.text();
        const detail = text ? text.slice(0, 140) : response.statusText;

        status.textContent = response.ok
          ? `Success [${response.status}]: ${detail}`
          : `Failed [${response.status}]: ${detail}`;
      } catch (error) {
        console.error(error);
        status.textContent = 'Request failed. Check network access and API availability.';
      }
    });
  });
});
