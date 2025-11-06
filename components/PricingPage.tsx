import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 3 social accounts',
        '10 scheduled posts per month',
        'Basic analytics',
        'Content calendar',
        'AI content generation (limited)'
      ],
      buttonText: 'Get Started',
      buttonLink: '/signup',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Unlimited social accounts',
        'Unlimited scheduled posts',
        'Advanced analytics',
        'Content calendar',
        'AI content generation',
        'Hashtag suggestions',
        'Post scheduling',
        'Priority support'
      ],
      buttonText: 'Start Free Trial',
      buttonLink: '/signup',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'Dedicated account manager',
        'Custom reporting',
        'API access',
        'White-label options',
        '24/7 priority support'
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that's right for you. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-lg p-8 border-2 ${
              plan.popular ? 'border-blue-600 transform scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-600 text-white text-center py-2 rounded-t-lg -mt-8 -mx-8 mb-4">
                <span className="font-semibold">Most Popular</span>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              {plan.period !== 'forever' && plan.period !== 'pricing' && (
                <span className="text-gray-600 ml-2">/{plan.period}</span>
              )}
              {plan.period === 'forever' && (
                <span className="text-gray-600 ml-2">/{plan.period}</span>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to={plan.buttonLink}
              className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {plan.buttonText}
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h3>
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-600">We accept all major credit cards and PayPal.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
            <p className="text-gray-600">Yes! All paid plans include a 14-day free trial. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

