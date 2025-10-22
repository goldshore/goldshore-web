window.addEventListener('load', () => {
  if (typeof window.SwaggerUIBundle !== 'function') {
    console.error('Swagger UI bundle failed to load.');
    return;
  }

  window.SwaggerUIBundle({
    url: '/openapi.json',
    dom_id: '#swagger-ui',
    presets: window.SwaggerUIBundle.presets.apis,
    layout: 'BaseLayout'
  });
});
