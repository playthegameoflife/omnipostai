import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: March 2024</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            At Omnipost, we respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you 
            use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Information We Collect</h2>
          <p className="text-gray-700 mb-4">We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
            <li><strong>Social Media Account Data:</strong> Information from your connected social media accounts (with your permission)</li>
            <li><strong>Content:</strong> Posts, images, and other content you create or upload through our platform</li>
            <li><strong>Usage Data:</strong> How you interact with our service, including pages visited and features used</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and operating system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Provide and maintain our service</li>
            <li>Schedule and publish your social media posts</li>
            <li>Generate analytics and insights about your content performance</li>
            <li>Send you important updates about your account and our service</li>
            <li>Improve and optimize our platform</li>
            <li>Respond to your inquiries and provide customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your personal information. 
            This includes encryption, secure servers, and regular security audits. However, no method 
            of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your data with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><strong>Social Media Platforms:</strong> To publish your content as authorized by you</li>
            <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., hosting, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Disconnect social media accounts at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to improve your experience on our platform. 
            You can control cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our service is not intended for users under the age of 13. We do not knowingly collect 
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this privacy policy, please contact us at:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> <a href="mailto:privacy@omnipost.ai" className="text-blue-600 hover:underline">privacy@omnipost.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;


