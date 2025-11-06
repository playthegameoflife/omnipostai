import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Terms of Service</h1>
        <p className="text-gray-600">Last updated: March 2024</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using Omnipost, you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to these Terms of Service, please 
            do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Omnipost is a social media management platform that allows users to schedule, publish, 
            and manage content across multiple social media platforms. We provide tools for content 
            creation, scheduling, analytics, and account management.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">To use our service, you must:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of your account credentials</li>
            <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
            <li>Be responsible for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Acceptable Use</h2>
          <p className="text-gray-700 mb-4">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Violate any laws or regulations in your jurisdiction</li>
            <li>Post content that is harmful, abusive, defamatory, or violates others' rights</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated systems to access the service without permission</li>
            <li>Resell or redistribute the service without our written consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Content Ownership</h2>
          <p className="text-gray-700 mb-4">
            You retain all ownership rights to the content you create and upload through Omnipost. 
            By using our service, you grant us a license to use, store, and transmit your content 
            solely for the purpose of providing the service to you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Social Media Account Connections</h2>
          <p className="text-gray-700 mb-4">
            When you connect your social media accounts, you authorize us to access and use your 
            account information and post content on your behalf. You can disconnect your accounts 
            at any time. We are not responsible for the content policies or actions of third-party 
            social media platforms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Payment and Billing</h2>
          <p className="text-gray-700 mb-4">
            If you subscribe to a paid plan:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>You agree to pay all fees associated with your subscription</li>
            <li>Subscriptions automatically renew unless cancelled</li>
            <li>You can cancel your subscription at any time</li>
            <li>Refunds are provided according to our refund policy</li>
            <li>We reserve the right to change our pricing with 30 days notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Service Availability</h2>
          <p className="text-gray-700 mb-4">
            We strive to provide reliable service but do not guarantee uninterrupted or error-free 
            operation. We may perform maintenance that temporarily affects service availability. 
            We are not liable for any losses resulting from service interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, Omnipost shall not be liable for any indirect, 
            incidental, special, or consequential damages arising from your use of the service. 
            Our total liability shall not exceed the amount you paid us in the 12 months preceding 
            the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Termination</h2>
          <p className="text-gray-700 mb-4">
            We may terminate or suspend your account immediately, without prior notice, if you 
            violate these Terms of Service. You may also terminate your account at any time 
            by contacting us or using the account settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these terms at any time. We will notify users of 
            significant changes via email or through our service. Continued use of the service 
            after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> <a href="mailto:legal@omnipost.ai" className="text-blue-600 hover:underline">legal@omnipost.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;


