import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Inkwell',
    description: 'Inkwell privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#f0ece4] mb-8">Privacy Policy</h1>

            <div className="space-y-6 text-[#6b6b6b] text-lg font-light leading-relaxed">
                <p className="text-sm text-[#6b6b6b]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">1. Information We Collect</h2>
                <p>We collect information you provide directly, including your name, email address, profile information, and the content you publish on Inkwell.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">2. How We Use Your Information</h2>
                <p>Your information is used to provide and improve Inkwell services, personalize your experience, and communicate with you about your account and activity.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">3. Data Storage</h2>
                <p>Your data is securely stored using industry-standard encryption. We use InsForge as our backend service provider to manage authentication, database, and storage services.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">4. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal information at any time through your dashboard settings.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">5. Cookies</h2>
                <p>Inkwell uses essential cookies for authentication and session management. We do not use tracking cookies or share data with third-party advertisers.</p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">6. Contact</h2>
                <p>If you have questions about this privacy policy, please reach out through our platform.</p>
            </div>
        </div>
    );
}
