import React from 'react';
import '../style/terms.css'; // Importiamo il file CSS per lo stile
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TermsAndConditionsEN = () => {
  const { t } = useTranslation();

  return (
    <div className="terms-container">
      <Link to="/it/terms" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        {t('ToItalian')}
      </Link>


      <header className="terms-header">
        <h1>Terms and Conditions of Service – SnakeBee</h1>
        <p className="last-updated">Last updated: Novembre 03, 2025</p>
      </header>

      <section>
        <p>
          Welcome to SnakeBee ("Platform", "Service", "we", "us", "our"). SnakeBee is a software platform for the management and monitoring of pet reptiles. Access to and use of our Service are subject to your acceptance of and compliance with these Terms and Conditions. If you do not agree to be bound by these Terms, you must not use the Platform.
        </p>
      </section>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Service, you declare that you have read, understood, and agree to these Terms and Conditions, as well as our Privacy Policy, which is an integral part of them. Use of the Service is permitted only to individuals who are at least 18 years of age or, for residents of the European Union, who are at least 14 years of age, provided that use is under the supervision and with the consent of a parent or legal guardian. You agree to provide true, accurate, and complete personal data during registration and to keep it updated.
        </p>
      </section>

      <section>
        <h2>2. Services Offered</h2>
        <p>
          SnakeBee provides an online platform that allows users to:
        </p>
        <ul>
          <li>Register and manage data related to their pet reptiles.</li>
          <li>Monitor the feeding, growth, and health status of the animals.</li>
          <li>Interact in a forum and blog dedicated to the community.</li>
          <li>Access additional features through a premium subscription.</li>
          <li>
            Use integration with third-party services, such as Telegram, to receive notifications and interact with the Service (where such functionality is made available).
          </li>
          <li>
            Consult dedicated sections ("Shop" and "Breeders") that may contain product showcases, services, or lists of professionals offered by third parties. SnakeBee acts solely as a space provider and is not a party to, nor responsible for, any transaction or relationship that may arise between you and such third parties.
          </li>
        </ul>
        <p>
          The Service is provided "as is" and "as available". We do not guarantee that the Service will always be uninterrupted, secure, error-free, or that defects will be corrected.
        </p>
      </section>

      <section>
        <h2>3. User Account Management</h2>
        <p><strong>Registration:</strong> To access certain features, you must create an account. Registration can be done directly or through a third-party authentication service (e.g., Google).</p>
        <p><strong>Responsibility:</strong> You are solely responsible for the security and confidentiality of your login credentials. Any activity conducted through your account is considered your responsibility, and you agree to notify us immediately of any unauthorized use of your account.</p>
        <p><strong>No Sharing:</strong> It is strictly forbidden to share your account with third parties. You may only hold one personal account.</p>
        <p><strong>Account Suspension/Closure:</strong> We reserve the right to suspend or close a user's account, at our discretion and without notice, in case of violation of these Terms, misuse of the Service, fraud, or any other activity considered harmful to the Platform or other users.</p>
      </section>

      <section>
        <h2>4. Subscriptions and Payments</h2>
        <p><strong>Premium Plans:</strong> We offer paid subscription plans ("Premium Plans") that unlock additional features. Pricing and feature details are specified on the Platform.</p>
        <p><strong>Payment Processor:</strong> All payments are processed through the third-party service Stripe. SnakeBee does not store or have access to users' sensitive payment data (e.g., credit card numbers). You agree to Stripe's terms and conditions.</p>
        <p><strong>VAT and Renewal:</strong> The prices shown include Value Added Tax (VAT), if applicable. Subscriptions automatically renew at the end of each billing cycle unless canceled.</p>
        <p><strong>Cancellation:</strong> You can cancel your subscription at any time from the "Manage Subscription" section of the Platform. The cancellation will take effect at the end of the current billing period.</p>
        <p><strong>Right of Withdrawal:</strong> Pursuant to Art. 59, paragraph 1, letter o) of the Consumer Code, you explicitly waive the 14-day right of withdrawal from the subscription of the service at the moment you request its immediate activation and use it. To this end, before activation, you will be asked to provide explicit consent via a specific checkbox.</p>
        <p><strong>Refunds:</strong> Refunds are at our sole discretion and will be handled in accordance with our internal refund policy. As a rule, refunds are not provided for subscriptions that are already active and have been used.</p>
      </section>

      <section>
        <h2>5. User-Generated Content</h2>
        <p><strong>Responsibility:</strong> You are solely and fully responsible for all content (text, images, data, etc.) that you enter, upload, publish, or share on the Platform.</p>
        <p><strong>Conduct:</strong> It is prohibited to post content that is unlawful, defamatory, offensive, vulgar, obscene, threatening, incites hatred, violates the rights of third parties (including copyright, trademark, privacy rights), or is otherwise not in compliance with the law and these Terms.</p>
        <p><strong>License:</strong> By posting content, you grant SnakeBee a non-exclusive, worldwide, perpetual, irrevocable, transferable, sub-licensable, and royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in any format and through any media channel, solely for the purposes of the Service and its promotion.</p>
        <p><strong>Moderation and Removal:</strong> We reserve the right, but not the obligation, to monitor, moderate, and remove any user content that, in our sole judgment, violates these Terms or applicable laws.</p>
<p><strong>Digital Services Act (DSA):</strong> In accordance with the DSA (Regulation (EU) 2022/2065), users can report content they believe to be unlawful by contacting us directly using the contact information in Section 12 (Contact Us). We are committed to reviewing reports promptly and taking appropriate action in accordance with the law.</p>      </section>

      <section>
        <h2>6. Referral Program</h2> {/* Ricorda di aggiornare il numero della sezione (es. "6.") */}
        <p>
SnakeBee may offer, at its discretion, a "Referral Program" (or "Affiliate Program") that allows registered users to obtain benefits (such as discounts, credits, or subscription extensions) by inviting new users to register and/or subscribe.        </p>
        <p><strong>Methods and Benefits:</strong> The specific methods and benefits for the inviting user ("Referrer") and for the invited user ("Referral") will be detailed and made known within the Platform.</p>
        <p><strong>Conditions and Abuses:</strong> Use of the Referral Program is subject to good faith conditions. Self-invitation, creating multiple accounts to simulate invitations, posting codes on generic coupon sites, or any other activity considered fraudulent or abusive is strictly prohibited.. </p>
        <p><strong>Modification and Suspension:</strong> We reserve the right to modify, suspend, or terminate the Referral Program at any time, without notice. We also reserve the right to invalidate or revoke earned benefits if we suspect abuse or violation of these terms.</p>
      </section>

      <section>
        <h2>7. Intellectual Property Rights</h2>
        <p>
          All intellectual property rights related to the Platform, including the software, code, design, logos, trademarks, and content provided by us, are our exclusive property or that of our licensors. Use of the Platform does not grant you any rights to such elements. It is forbidden to copy, reproduce, modify, distribute, or use in any way our copyrighted material without our written permission.
        </p>
      </section>

      <section>
        <h2>8. Limitations of Liability</h2>
        <p><strong>Disclaimer of Warranties:</strong> SnakeBee provides the Service "as is" and "as available". We make no warranties, express or implied, regarding the accuracy, reliability, availability, or functionality of the Service. We do not guarantee that the Service will be uninterrupted, error-free, or virus-free.</p>
        <p><strong>Veterinary Disclaimer:</strong> The features offered by SnakeBee, including those for monitoring nutrition and health status, are provided for informational and management purposes only. The Service does not constitute, and is not intended to replace, professional veterinary diagnosis, advice, or treatment. For any health concerns regarding your animals, you should consult a qualified veterinarian promptly. SnakeBee assumes no responsibility for animal health decisions based solely on use of the Platform.</p>
        <p><strong>Indirect Damages:</strong> To the maximum extent permitted by law, SnakeBee, its directors, employees, and affiliates will in no event be liable for any indirect, incidental, special, consequential, or exemplary damages, including, but not limited to, damages for loss of profits, data, or other intangible losses, arising from the use or inability to use the Platform.</p>
        <p><strong>Content Liability:</strong> We are not responsible for the correctness, accuracy, or legality of the content posted by users. You release SnakeBee from any liability and agree to indemnify it against any claim, demand, or legal action from third parties that may arise from the content you have published.</p>
        <p><strong>Security:</strong> We cannot guarantee the total security of data and communications. Although we use appropriate security measures, we cannot be held responsible for any unauthorized access, data loss, or damage caused by the actions of third parties (e.g., hackers, phishing, malware).</p>
      </section>

      <section>
        <h2>9. Privacy and Data Protection</h2>
        <p>
          The processing of users' personal data is governed by our Privacy Policy, available at the following <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. By using the Service, you consent to the processing of your personal data as described in that policy.
        </p>
      </section>

      <section>
        <h2>10. Changes to the Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time, at our sole discretion. Changes will be made known to users via an email to the registered address or a notification on the Platform. Your continued use of the Service after the publication of the changes constitutes acceptance of the new Terms. If you do not accept the new Terms, you must cease using the Service and close your account.
        </p>
      </section>

      <section>
        <h2>11. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by and interpreted in accordance with Italian law.
        </p>
        <ul>
          <li><strong>For consumer users:</strong> The dispute will be referred to the court of the consumer's place of residence or domicile, if located in Italy.</li>
          <li><strong>For non-consumer users (e.g., businesses or professionals):</strong> The dispute will be exclusively referred to the Court of Turin.</li>
        </ul>
      </section>

      <section>
        <h2>12. Final Provisions</h2>
        <p><strong>Severability:</strong> Should one or more provisions of these Terms be deemed invalid or unenforceable by a competent court, the remaining provisions shall remain in full force and effect.</p>
        <p><strong>Communications:</strong> All legal and administrative communications must be sent to the email address and physical address indicated in the "Contacts" section.</p>
      </section>

      <section className="contact-section">
        <h2>13. Contacts</h2>
        <p>
          For any questions, requests, complaints, or to receive information, please contact SnakeBee at the following addresses:
        </p>
        <div className="contact-details">
          <p><strong>Email:</strong> <a href="mailto:support@snakebee.it">support@snakebee.it || simonevaira@postecertifica.it</a></p>
          <p><strong>Address:</strong> via varaita 10 torino</p>
          <p><strong>VAT Number:</strong> 13308020018</p>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditionsEN;