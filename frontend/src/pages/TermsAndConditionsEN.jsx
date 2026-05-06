import React from 'react';
import '../style/terms.css'; // Importing the CSS file for styling
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
        <p className="last-updated">Last updated: February 01, 2026</p>
      </header>

      <section>
        <p>
          Welcome to SnakeBee ("Platform", "Service", "we", "us", "our"). SnakeBee is a software platform for the management and monitoring of pet reptiles. Access to and use of our Service are subject to the acceptance of and compliance with these Terms and Conditions. If you do not agree to be bound by these Terms, you must not use the Platform.
        </p>
      </section>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Service, the user declares to have read, understood, and accepted these Terms and Conditions, as well as our Privacy Policy, which constitutes an integral part thereof.
          Access to the Service is permitted to individuals over 18 years of age. Users between 14 and 18 years of age may use the Platform exclusively under the supervision of a parent or legal guardian, who assumes responsibility for the user's contractual and financial obligations.
          The user agrees to provide true, accurate, and complete personal data during registration and to keep it updated.
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
          <li>Access additional features via premium subscription.</li>
          <li>Purchase reptile equipment packages (Kits) directly through our integrated Store.</li>
          <li>
            Use integration with third-party services, such as Telegram, to receive notifications and interact with the Service (where such functionality is made available).
          </li>
          <li>
            SnakeBee acts merely as a hosting provider for third-party 'Shop' and 'Breeders' sections. SnakeBee does not control, approve, or guarantee the quality, safety, or legality of the products/services offered by third parties. Breeder profiles are displayed based on [CRITERION: e.g., registration date/geographical proximity]. Any transaction occurs exclusively between the user and the third party.
          </li>
        </ul>
        <p>
          The Service is provided "as is" and "as available". We do not guarantee that the Service will always be uninterrupted, secure, error-free, or that defects will be corrected.
        </p>
      </section>

      <section>
        <h2>3. User Account Management</h2>
        <p><strong>Registration:</strong> To access certain features, it is necessary to create an account. Registration can take place directly or via a third-party authentication service (e.g., Google).</p>
        <p><strong>Responsibility:</strong> The user is solely responsible for the security and confidentiality of their access credentials. Any activity carried out through the account is considered the responsibility of the user, who agrees to notify us immediately of any unauthorized use of their account.</p>
        <p><strong>Prohibition of Sharing:</strong> Sharing the account with third parties is strictly prohibited. The user may hold only one personal account.</p>
        <p><strong>Suspension/Closing of Account:</strong> SnakeBee reserves the right to suspend or close the account in the event of serious violations of these Terms (e.g., fraud, spam, illegal content), following reasoned notification to the user, except in cases of urgency or legal obligations.</p>
      </section>

      <section>
        <h2>4. Subscriptions and Payments</h2>
        <p><strong>Premium Plans:</strong> We offer paid subscription plans ("Premium Plans") that unlock additional features. Pricing and feature details are specified on the Platform.</p>

        <p><strong>Benefit Market (Discount Vouchers):</strong> Some subscription plans may include the monthly issuance of a discount voucher, non-redeemable for cash, to be used exclusively on the internal shop "SnakeBee Market" (<a href="https://snakebee.it/store" target="_blank" rel="noopener noreferrer">https://market.snakebee.it</a>). The following conditions apply:</p>
        <ul>
          <li>The voucher is generated and sent monthly in conjunction with the subscription renewal.</li>
          <li>The voucher is valid only for the reference month and <strong>cannot be combined</strong> with subsequent months or other vouchers.</li>
          <li>In case of non-use by the expiration date (next renewal), the voucher expires and will not be refundable.</li>
          <li>SnakeBee reserves the right to modify the amount of the voucher or suspend the benefit with 30 days' notice.</li>
          <li>The reward is issued only via discount voucher within 48 hours of activation/renewal of the subscription.</li>
          <li>The voucher, like the SnakeBee Market service, is usable only in Italy.</li>
        </ul>
        <p><strong>Payment Processor:</strong> All payments are processed through the third-party service Stripe. SnakeBee does not store nor have access to users' sensitive payment data (e.g., credit card numbers). The user accepts Stripe's terms and conditions.</p>
        <p><strong>VAT and Renewal:</strong> The indicated prices include Value Added Tax (VAT), if applicable. Subscriptions automatically renew at the end of each billing cycle unless cancelled.</p>
        <p><strong>Cancellation:</strong> The user can cancel their subscription at any time from the "Manage Subscription" section of the Platform. The cancellation will take effect at the end of the current billing period.</p>
        <p><strong>Right of Withdrawal:</strong> By subscribing to the Premium Subscription, the user requests the immediate execution of the Service. Pursuant to Art. 59, let. o) of the Consumer Code, the user accepts that, with the activation of the Premium features, they will no longer be able to exercise the right of withdrawal.</p>
        <p><strong>Refunds:</strong> Refunds are at our sole discretion and will be handled in accordance with our internal refund policy. Generally, no refunds are provided for subscriptions already active and used.</p>
      </section>

      <section>
        <h2>5. Online Store and Product Purchase (Kits)</h2>
        <p><strong>Purchases:</strong> Through the Store integrated into the Platform, the user can purchase reptile equipment packages (Kits) sold directly by SnakeBee. The order is considered confirmed and the sale contract concluded only upon receipt of an order confirmation email from us.</p>

        <p><strong>Prices and Availability:</strong> All prices are expressed in Euro and are inclusive of VAT (if applicable). We reserve the right to change product prices at any time. Product images are for illustrative purposes only. In case of unavailability of a product after placing the order, the user will be promptly informed and fully refunded.</p>

        <p><strong>Shipping and Delivery:</strong> Estimated shipping times and costs are indicated at checkout. SnakeBee strives to respect these timelines but is not responsible for any delays attributable to the courier or force majeure.</p>

        <p><strong>Right of Withdrawal (Returns):</strong> Pursuant to Legislative Decree 206/2005 (Consumer Code), the consumer user has the right to withdraw from the purchase contract for physical goods within 14 days of receiving the goods, without having to provide any reason. To exercise this right, the user must contact us at the email address indicated in the Contacts section. Shipping costs for returning the item are the responsibility of the user. The product must be returned intact, unused, and in its original packaging. In case of withdrawal for physical products, SnakeBee will refund all payments received, including standard delivery costs, within 14 days of receiving the goods. SnakeBee adheres to WEEE (RAEE) regulations: the user is informed of the obligation not to dispose of electrical equipment (e.g., thermostats) as urban waste. <em>Note: The right of withdrawal is excluded for goods that are likely to deteriorate or expire rapidly (e.g., live food) or for custom-made goods.</em></p>

        <p><strong>Legal Warranty:</strong> All physical products sold directly by SnakeBee are covered by the 24-month legal warranty for lack of conformity, pursuant to the Consumer Code. In case of a defective product, the user is entitled to free repair or replacement.</p>

        <p><strong>Payments:</strong> Store transactions are managed in total security via Stripe. The payment processing conditions are the same as those applied for subscriptions (see Section 4).</p>
      </section>

      <section>
        <h2>6. User-Generated Content</h2>
        <p><strong>Responsibility:</strong> The user is solely and fully responsible for all content (texts, images, data, etc.) that they insert, upload, publish, or share on the Platform.</p>
        <p><strong>Conduct:</strong> It is forbidden to publish content that is illegal, defamatory, offensive, vulgar, obscene, threatening, inciting hatred, violating third-party rights (including copyright, trademark, privacy rights), or otherwise non-compliant with the law and these Terms.</p>
        <p><strong>License:</strong> The user grants SnakeBee a free and non-exclusive license to use the published content, limited to the duration of the account's presence on the Platform and aimed exclusively at providing the Service. Reports of illegal content can be sent to [EMAIL], including the description of the content and the link.</p>
        <p><strong>Moderation and Removal:</strong> We reserve the right, but not the obligation, to monitor, moderate, and remove any user content that, in our sole discretion, violates these Terms or applicable laws.</p>
        <p><strong>Digital Services Act (DSA):</strong> In accordance with the DSA (Regulation (EU) 2022/2065), users can report content they consider illegal by contacting us directly at the contact details indicated in Section 12 (Contacts). We are committed to reviewing reports in a timely manner and taking necessary measures in accordance with the law.</p>      </section>

      <section>
        <h2>7. Referral Program</h2>
        <p>
          SnakeBee may offer, at its discretion, a "Referral Program" (or "Affiliate Program") that allows registered users to obtain benefits (such as discounts, credits, or subscription extensions) by inviting new users to register and/or subscribe.
        </p>
        <p><strong>Procedures and Benefits:</strong> The specific procedures, benefits for the inviting user ("Referrer"), and for the invited user ("Referral") will be detailed and made known within the Platform.</p>
        <p><strong>Conditions and Abuse:</strong> Use of the Referral Program is subject to conditions of good faith. Self-inviting, creating multiple accounts to simulate invitations, publishing codes on generic coupon sites, or any other activity considered fraudulent or abusive is strictly prohibited.</p>
        <p><strong>Modification and Suspension:</strong> SnakeBee reserves the right to modify the Referral Program with 30 days' notice. Benefits already earned by the user at the time of modification will not be prejudiced, except in cases of suspected abuse or fraud.</p>
      </section>

      <section>
        <h2>8. Intellectual Property Rights</h2>
        <p>
          All intellectual property rights related to the Platform, including software, code, design, logos, trademarks, and content provided by us, are our exclusive property or that of our licensors. Use of the Platform does not grant the user any rights over such elements. It is forbidden to copy, reproduce, modify, distribute, or use our copyrighted material in any way without our written permission.
        </p>
      </section>

      <section>
        <h2>9. Limitations of Liability</h2>
        <p><strong>Disclaimer of Warranties:</strong> SnakeBee provides the Service "as is" and "as available". We make no warranties, express or implied, regarding the accuracy, reliability, availability, or functionality of the Service. We do not guarantee that the Service will be uninterrupted, error-free, or virus-free.</p>
        <p><strong>Veterinary Disclaimer:</strong> The features offered by SnakeBee, including those for monitoring feeding and health status, are provided exclusively for informational and management purposes. The Service does not constitute, and is not intended to replace in any way, a professional veterinary diagnosis, advice, or treatment. For any health problem related to their animals, the user is required to promptly consult a qualified veterinarian. SnakeBee assumes no responsibility for decisions related to animal health based exclusively on the use of the Platform.</p>
        <p><strong>Indirect Damages:</strong> To the maximum extent permitted by law, SnakeBee, its directors, employees, and affiliates shall in no case be liable for indirect, incidental, special, consequential, or exemplary damages, including, but not limited to, damages for loss of profits, data, or other intangible losses, resulting from the use or inability to use the Platform.</p>
        <p><strong>Liability for Content:</strong> SnakeBee does not exclude or limit its liability for willful misconduct or gross negligence. For any other case, SnakeBee's liability is limited to the total amount paid by the user in the 12 months preceding the damaging event.</p>
        <p><strong>Security:</strong> We cannot guarantee the total security of data and communications. Although we use appropriate security measures, we cannot be held responsible for any unauthorized access, data loss, or damage caused by third-party actions (e.g., hackers, phishing, malware).</p>
      </section>

      <section>
        <h2>10. Privacy and Data Protection</h2>
        <p>
          The processing of users' personal data is governed by our Privacy Policy, available at the following link: <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. By using the Service, the user acknowledges the processing of their personal data as described in that policy.
        </p>
      </section>

      <section>
        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time, at our sole discretion. Changes will be made known to users via an email to the registered address or a notification on the Platform. Continued use of the Service after the publication of changes constitutes acceptance of the new Terms. If the user does not accept the new Terms, they must cease using the Service and close their account.
        </p>
      </section>

      <section>
        <h2>12. Applicable Law and Jurisdiction</h2>
        <p>
          These Terms are governed by and interpreted in accordance with Italian law.
        </p>
        <ul>
          <li><strong>For consumer users:</strong> The dispute will be referred to the court of the place of residence or domicile of the consumer, if located in Italy.</li>
          <li><strong>For non-consumer users (e.g., companies or professionals):</strong> The dispute will be referred exclusively to the Court of Turin.</li>
          <li>In accordance with Art. 14 of Regulation (EU) No. 524/2013, the user is informed that it is possible to file a complaint via the European Union's ODR platform at the following link: http://ec.europa.eu/consumers/odr/.</li>
        </ul>
      </section>

      <section>
        <h2>13. Final Provisions</h2>
        <p><strong>Invalidity:</strong> Should one or more provisions of these Terms be held invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.</p>
        <p><strong>Communications:</strong> All legal and administrative communications must be sent to the email address and physical address indicated in the "Contacts" section.</p>
      </section>

      <section className="contact-section">
        <h2>14. Contacts</h2>
        <p>
          For any questions, requests, complaints, or to receive information, please contact SnakeBee at the following details:
        </p>
        <div className="contact-details">
          <p><strong>Email:</strong> <a href="mailto:support@snakebee.it">support@snakebee.it || PEC simonevaira@postecertifica.it</a></p>
          <p><strong>Address:</strong> via varaita 10, torino</p>
          <p><strong>VAT Number:</strong> 13308020018</p>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditionsEN;