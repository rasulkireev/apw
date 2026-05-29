import React, { useState, useEffect } from 'react';

const FullWidthNewsletter = ({ title, description, tag, source = '' }) => {
  const [formState, setFormState] = useState({
    userName: '',
    userEmail: '',
    isSubmitting: false,
    message: '',
    isError: false,
  });

  const [userIp, setUserIp] = useState('');

  // Fetch user's IP address when component mounts
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
          const data = await response.json();
          setUserIp(data.ip);
        }
      } catch (error) {
        // Continue without IP if fetch fails
      }
    };

    fetchIP();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormState({ ...formState, isSubmitting: true });

    const formData = {
      name: formState.userName,
      email: formState.userEmail,
      tag: tag,
      source: source,
      ip_address: userIp,
    };

    try {
      const response = await fetch('https://windmill.cr.lvtd.dev/api/w/main/jobs/run/p/u/rasul/add_buttondown_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 9eHmmwaBQ9eKfT8Sr88ZRrOxKkXRl1gY',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState({
          ...formState,
          isSubmitting: false,
          message: 'Thanks for subscribing. You should receive an email soon.',
          isError: false,
        });
      } else {
        setFormState({
          ...formState,
          isSubmitting: false,
          message: 'Subscription failed. Please try again.',
          isError: true,
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setFormState({
        ...formState,
        isSubmitting: false,
        message: 'Subscription failed. Please try again.',
        isError: true,
      });
    }
  };

  // JSX to render the form or the message
  return (
    <div className="surface-panel newsletter-panel">
      <h2 className="newsletter-title">{title}</h2>
      <p className="newsletter-description">{description}</p>

      {/* Conditional rendering based on formState */}
      {formState.message ? (
        <div
          className={`form-message ${
            formState.isError ? 'is-error' : ''
          }`}
        >
          {formState.message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form">
          <input
            type="text"
            name="userName"
            value={formState.userName}
            onChange={handleInputChange}
            placeholder="First name"
            className="newsletter-input"
          />
          <input
            type="email"
            name="userEmail"
            value={formState.userEmail}
            onChange={handleInputChange}
            placeholder="Email"
            className="newsletter-input"
            required
          />
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="primary-button"
          >
            {formState.isSubmitting ? 'Submitting' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FullWidthNewsletter;
