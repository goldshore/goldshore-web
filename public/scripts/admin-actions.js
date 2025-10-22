document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('admin-status');
  const actionable = document.querySelectorAll('[data-endpoint][data-method]');

  actionable.forEach((element) => {
    element.addEventListener('click', async () => {
      if (!status) return;
      const endpoint = element.getAttribute('data-endpoint');
      const method = element.getAttribute('data-method') || 'GET';
      if (!endpoint) {
        return;
      }

      status.textContent = `Running ${method} request to ${endpoint}…`;
      try {
        const response = await fetch(endpoint, {
          method,
          credentials: 'include',
          headers:
            method === 'POST'
              ? {
                  'Content-Type': 'application/json'
                }
              : undefined,
          body: method === 'POST' ? JSON.stringify({}) : undefined
        });
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
