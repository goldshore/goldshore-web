document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[data-admin-endpoint]');
  forms.forEach((form) => {
    const endpoint = form.getAttribute('data-admin-endpoint');
    const method = (form.getAttribute('data-admin-method') || 'POST').toUpperCase();
    const statusId = form.getAttribute('data-admin-status-id');
    const pendingText = form.getAttribute('data-admin-pending') || `Submitting ${method} request…`;
    const successText = form.getAttribute('data-admin-success') || 'Request completed successfully.';
    const status = statusId ? document.getElementById(statusId) : null;

    if (!endpoint || !status) {
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = pendingText;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(endpoint, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: method === 'GET' ? undefined : JSON.stringify(payload)
        });

        const text = await response.text();
        if (response.ok) {
          status.textContent = successText;
          if (method !== 'GET') {
            form.reset();
          }
        } else {
          status.textContent = `API error ${response.status}: ${text}`;
        }
      } catch (error) {
        console.error(error);
        status.textContent = 'Request failed. Verify connectivity and try again.';
      }
    });
  });
});
