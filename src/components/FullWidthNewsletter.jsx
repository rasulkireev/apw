import React, { useState } from 'react';

const FullWidthNewsletter = ({ title, description, tag }) => {
  const [formState, setFormState] = useState({
    userName: '',
    userEmail: '',
    isSubmitting: false,
    message: '',
    isError: false,
  });


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name === 'name' ? 'userName' : 'userEmail']: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormState({ ...formState, isSubmitting: true });

    const formData = {
      name: formState.userName,
      email: formState.userEmail,
      tag: tag,
      website: new FormData(event.currentTarget).get('website'),
    };

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState({
          ...formState,
          isSubmitting: false,
          message: 'Check your inbox for a confirmation link. If you are already subscribed, you are all set.',
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
    } catch {
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
    <div className="p-4 my-4 border-2 border-green-300 rounded">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mb-2 text-xl">{description}</p>

      <p className="mb-2 text-sm">Confirm your email to subscribe. Unsubscribe at any time.</p>
      {formState.isError && <p role="alert">{formState.message}</p>}
      {/* Conditional rendering based on formState */}
      {formState.message && !formState.isError ? (
        <div role="status" aria-live="polite"
          className={`w-full p-2 text-lg text-gray-700 border rounded mt-2 ${
            formState.isError ? 'bg-red-100 border-red-700' : 'bg-green-100 border-green-700'
          }`}
        >
          {formState.message}
        </div>
      ) : (
        <form method="post" action="/api/newsletter" onSubmit={handleSubmit} className="flex flex-col md:flex-row">
          <input
            type="text"
            name="name"
            aria-label="First name"
            autoComplete="given-name"
            maxLength={100}
            value={formState.userName}
            onChange={handleInputChange}
            placeholder="First Name"
            className="w-full p-1 mb-2 leading-tight text-gray-800 bg-gray-200 border border-gray-500 rounded appearance-none md:h-10 md:mr-2 focus:outline-none focus:bg-white md:w-64"
          />
          <input
            type="email"
            name="email"
            aria-label="Email address"
            autoComplete="email"
            maxLength={254}
            required
            value={formState.userEmail}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-1 mb-2 leading-tight text-gray-800 bg-gray-200 border border-gray-500 rounded appearance-none md:mr-2 md:h-10 focus:outline-none focus:bg-white md:w-64"
          />
          <input type="hidden" name="tag" value={tag || ''} />
          <div hidden aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className={`w-full text-lg font-semibold text-center text-white no-underline bg-green-500 border border-green-500 rounded cursor-pointer md:h-10 sm:w-32 ${
              formState.isSubmitting ? 'opacity-25' : 'opacity-100'
            }`}
          >
            {formState.isSubmitting ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FullWidthNewsletter;
