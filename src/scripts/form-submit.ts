document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-api-form]');

  forms.forEach((form) => {
    const endpoint = form.getAttribute('data-endpoint');
    const method = (form.getAttribute('data-method') || 'POST').toUpperCase();
    const statusSelector = form.getAttribute('data-status-target');
    const successMessage = form.getAttribute('data-success-message') || 'Request completed successfully.';
    const pendingMessage = form.getAttribute('data-pending-message') || 'Submitting…';
    const errorMessage = form.getAttribute('data-error-message');
    const resetOnSuccess = form.hasAttribute('data-reset-on-success');
    const includeCredentials = form.hasAttribute('data-include-credentials');
    const credentialsAttr = form.getAttribute('data-credentials');
    const normalizedCredentials = credentialsAttr?.trim().toLowerCase();
    const credentials: RequestCredentials = (() => {
      switch (normalizedCredentials) {
        case 'include':
        case 'same-origin':
        case 'omit':
          return normalizedCredentials;
        default:
          return 'omit';
      }
    })();
    const status = statusSelector ? document.querySelector<HTMLElement>(statusSelector) : null;

    if (!endpoint) {
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

      let shouldIncludeCredentials = form.hasAttribute('data-include-credentials');

      if (!shouldIncludeCredentials) {
        try {
          const parsedEndpoint = new URL(endpoint, window.location.origin);
          if (parsedEndpoint.origin === window.location.origin) {
            shouldIncludeCredentials = true;
          }
        } catch (error) {
          console.warn('Invalid endpoint URL for API form', endpoint, error);
        }
      }

      const requestInit: RequestInit = {
        method,
        headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
        body: method === 'GET' ? undefined : JSON.stringify(payload)
      };

      if (shouldIncludeCredentials) {
        requestInit.credentials = 'include';
      }

      try {
        const response = await fetch(endpoint, requestInit);
      const endpointUrl = (() => {
        try {
          return new URL(endpoint, window.location.origin);
        } catch (error) {
          console.warn('Invalid endpoint URL for API form', endpoint, error);
          return null;
        }
      })();

      const credentials: RequestCredentials = includeCredentials
        ? 'include'
        : endpointUrl && endpointUrl.origin === window.location.origin
          ? 'same-origin'
          : 'omit';

      try {
        const endpointUrl = new URL(endpoint, window.location.origin);
        const shouldIncludeCredentials =
          form.hasAttribute('data-include-credentials') || endpointUrl.origin === window.location.origin;

        const requestInit: RequestInit = {
          method,
          credentials: 'include',
          credentials,
          headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
          body: method === 'GET' ? undefined : JSON.stringify(payload)
        };

        if (shouldIncludeCredentials) {
          requestInit.credentials = 'include';
        }

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
