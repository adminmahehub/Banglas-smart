import type { Metadata } from 'next';
import LegalPage, { H2, P, UL } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'How to ask MaheHub to delete your account and the data linked to it.',
  alternates: { canonical: '/account-deletion/' },
};

export default function Page() {
  return (
    <LegalPage title="Delete your MaheHub account" updated="14 October 2026">
      <P>You can ask us to delete your MaheHub account and the data linked to it at any time.</P>

      <H2>How to ask</H2>
      <UL>
        <li>Email <a href="mailto:b2b@mahehub.com?subject=Delete%20my%20MaheHub%20account" style={{ color: '#0b7a55' }}>b2b@mahehub.com</a> with the subject “Delete my MaheHub account”. Write the WhatsApp or phone number your account uses (with country code).</li>
        <li>Or send the same request from that number to our WhatsApp support desk shown on smartdns.mahehub.com.</li>
      </UL>
      <P>We confirm the request came from the account owner, then delete the account.</P>

      <H2>What is deleted</H2>
      <UL>
        <li>Your name, phone number, plan and expiry details.</li>
        <li>The activated network address (IP) and the phone identifier linked to your account.</li>
        <li>Your personal link and login records.</li>
      </UL>
      <P>This is done within 30 days. Your service stops working when the account is deleted, and unused time on a plan is not refunded. We may keep minimal records that we must keep for security or legal reasons.</P>

      <H2>Resellers</H2>
      <P>Reseller accounts are deleted the same way. Customers created by a reseller stay active unless they also ask for deletion.</P>
    </LegalPage>
  );
}
