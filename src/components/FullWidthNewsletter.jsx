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
        console.log('Could not fetch IP address:', error);
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
      const response = await fetch('https://windmill.cr.lvtd.dev/api/w/main/jobs/run/p/u/rasul/improving_script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer joeKSWJRzHZnNMFXq39GJXYc1mshy2',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState({
          ...formState,
          isSubmitting: false,
          message: 'Thank for subscribing! You should receive an email soon.',
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
    <div className="p-4 my-4 border-2 border-green-300 rounded">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mb-2 text-xl">{description}</p>

      {/* Conditional rendering based on formState */}
      {formState.message ? (
        <div
          className={`w-full p-2 text-lg text-gray-700 border rounded mt-2 ${
            formState.isError ? 'bg-red-100 border-red-700' : 'bg-green-100 border-green-700'
          }`}
        >
          {formState.message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
          <input
            type="text"
            name="userName"
            value={formState.userName}
            onChange={handleInputChange}
            placeholder="First Name"
            className="w-full p-1 mb-2 leading-tight text-gray-800 bg-gray-200 border border-gray-500 rounded appearance-none md:h-10 md:mr-2 focus:outline-none focus:bg-white md:w-64"
          />
          <input
            type="email"
            name="userEmail"
            value={formState.userEmail}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-1 mb-2 leading-tight text-gray-800 bg-gray-200 border border-gray-500 rounded appearance-none md:mr-2 md:h-10 focus:outline-none focus:bg-white md:w-64"
          />
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
