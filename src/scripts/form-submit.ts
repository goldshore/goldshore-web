document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-api-form]');

  forms.forEach((form) => {
    const endpointAttr = form.getAttribute('data-endpoint');
    const method = (form.getAttribute('data-method') || 'POST').toUpperCase();
    const statusSelector = form.getAttribute('data-status-target');
    const status = statusSelector ? document.querySelector<HTMLElement>(statusSelector) : null;
    const successMessage = form.getAttribute('data-success-message') || 'Request completed successfully.';
    const pendingMessage = form.getAttribute('data-pending-message') || 'Submitting…';
    const errorMessage = form.getAttribute('data-error-message');
    const resetOnSuccess = form.hasAttribute('data-reset-on-success');
    const explicitCredentialsAttr = form.getAttribute('data-credentials');
    const explicitCredentials: RequestCredentials | null =
      explicitCredentialsAttr === 'include' ||
      explicitCredentialsAttr === 'same-origin' ||
      explicitCredentialsAttr === 'omit'
        ? explicitCredentialsAttr
        : null;
    const forceIncludeCredentials = form.hasAttribute('data-include-credentials');

    if (!endpointAttr) {
      console.warn('Missing data-endpoint on API form', form);
      return;
    }

    if (!status) {
      console.warn('Missing status target for API form', form);
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = pendingMessage;

      const formData = new FormData(form);
      const payload: Record<string, FormDataEntryValue> = {};

      formData.forEach((value, key) => {
        payload[key] = value;
      });

      let resolvedEndpoint: URL | null = null;

      try {
        resolvedEndpoint = new URL(endpointAttr, window.location.origin);
      } catch (error) {
        console.warn('Invalid endpoint URL for API form', endpointAttr, error);
      }

      const requestInit: RequestInit = {
        method,
        headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' }
      };

      if (method !== 'GET') {
        requestInit.body = JSON.stringify(payload);
      }

      if (explicitCredentials) {
        requestInit.credentials = explicitCredentials;
      } else if (forceIncludeCredentials) {
        requestInit.credentials = 'include';
      } else if (resolvedEndpoint && resolvedEndpoint.origin === window.location.origin) {
        requestInit.credentials = 'same-origin';
      }

      try {
        const endpoint = resolvedEndpoint ? resolvedEndpoint.toString() : endpointAttr;
        const response = await fetch(endpoint, requestInit);
        const detail = await response.text();

        if (!response.ok) {
          status.textContent = errorMessage || `API error ${response.status}: ${detail || response.statusText}`;
          return;
        }

        status.textContent = successMessage;

        if (resetOnSuccess) {
          form.reset();
        }
      } catch (error) {
        console.error(error);
        status.textContent = errorMessage || 'Request failed. Verify connectivity and try again.';
      }
    });
  });
});
