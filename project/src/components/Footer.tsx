import React from 'react';
import { Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Support', href: '#support' },
    { label: 'Contact', href: '#contact' },
  ];

  const legalLinks = [
    { label: 'Terms of Use', href: '#terms' },
    { label: 'Privacy Policy', href: '#privacy' },
  ];

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: '#' },
    { Icon: Linkedin, label: 'LinkedIn', href: '#' },
    { Icon: Twitter, label: 'X (Twitter)', href: '#' },
    { Icon: Facebook, label: 'Facebook', href: '#' },
  ];

  return (
    <footer className="bg-[#F8FAFC] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-[5%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <a
              href="/"
              className="text-[#2A3342] text-2xl font-semibold"
              aria-label="NutriDecode+ Home"
            >
              NutriDecode+
            </a>
            <p className="text-gray-600 max-w-[300px]">
              Empowering healthier food choices through innovative technology and data-driven insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-[#64748B] hover:text-[#4F46E5] transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.Icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E2E8F0] pt-8">
          <p className="text-[#64748B] text-sm text-center">
            © 2025 NutriDecode+. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;