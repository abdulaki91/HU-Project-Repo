import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

export function LegalModal({ isOpen, onClose, type = "terms" }) {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Terms of Service",
      content: `
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using the Haramaya University Project Store (HUPS), you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>2. Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials on HUPS for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
        <ul>
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
          <li>attempt to decompile or reverse engineer any software contained on HUPS;</li>
          <li>remove any copyright or other proprietary notations from the materials.</li>
        </ul>
        
        <h3>3. User Accounts</h3>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
        
        <h3>4. Content Guidelines</h3>
        <p>Users are responsible for the content they upload. All projects must be original work or properly attributed. Plagiarism, copyright infringement, or inappropriate content will result in account suspension.</p>
        
        <h3>5. Privacy</h3>
        <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.</p>
        
        <h3>6. Termination</h3>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        
        <h3>7. Contact Information</h3>
        <p>If you have any questions about these Terms of Service, please contact us at admin@haramaya.edu.et</p>
      `,
    },
    privacy: {
      title: "Privacy Policy",
      content: `
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, upload projects, or contact us for support.</p>
        
        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services;</li>
          <li>Process transactions and send related information;</li>
          <li>Send technical notices, updates, security alerts, and support messages;</li>
          <li>Respond to your comments, questions, and customer service requests.</li>
        </ul>
        
        <h3>3. Information Sharing</h3>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
        
        <h3>4. Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h3>5. Data Retention</h3>
        <p>We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
        
        <h3>6. Your Rights</h3>
        <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>
        
        <h3>7. Cookies</h3>
        <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience.</p>
        
        <h3>8. Changes to Privacy Policy</h3>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        
        <h3>9. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@haramaya.edu.et</p>
      `,
    },
  };

  const currentContent = content[type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentContent.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: currentContent.content }}
            style={{
              lineHeight: "1.6",
            }}
          />
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}

export function useLegalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState("terms");

  const openTerms = () => {
    setModalType("terms");
    setIsOpen(true);
  };

  const openPrivacy = () => {
    setModalType("privacy");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    modalType,
    openTerms,
    openPrivacy,
    close,
  };
}
