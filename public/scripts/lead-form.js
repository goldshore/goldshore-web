document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lead-form');
  const status = document.getElementById('lead-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Sending…';
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message')
    };
    try {
      const response = await fetch('https://api.goldshore.org/v1/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Lead submission failed with status ${response.status}`);
      }
      status.textContent = 'Thanks! The team will reach out shortly.';
      form.reset();
    } catch (error) {
      console.error(error);
      status.textContent = 'We could not send your request. Email hello@goldshore.org and we will help right away.';
    }
  });
});
