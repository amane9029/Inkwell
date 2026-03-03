import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Inkwell',
    description: 'Inkwell terms of service — rules for using our platform.',
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#f0ece4] mb-8">Terms of Service</h1>

            <div className="space-y-6 text-[#6b6b6b] text-lg font-light leading-relaxed">
                <p className="text-sm text-[#6b6b6b]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">1. Acceptance of Terms</h2>
                <p>By accessing or using Inkwell, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">2. User Content</h2>
                <p>You retain ownership of all content you create and publish on Inkwell. By publishing, you grant Inkwell a non-exclusive license to display your content on the platform.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">3. Acceptable Use</h2>
                <p>You agree not to publish content that is illegal, harmful, threatening, abusive, or violates the rights of others. Inkwell reserves the right to remove content that violates these terms.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">4. Account Responsibility</h2>
                <p>You are responsible for maintaining the security of your account and all activity that occurs under your account.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">5. Limitation of Liability</h2>
                <p>Inkwell is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from your use of the platform.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">6. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of Inkwell after changes constitutes acceptance of the updated terms.</p>
            </div>
        </div>
    );
}
