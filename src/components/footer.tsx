'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Gamepad2,
  Headphones,
  Mail,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const shopLinks = [
  { label: 'Gift Cards', href: '/?category=gift-cards' },
  { label: 'Game Keys', href: '/?category=game-keys' },
  { label: 'Gaming Accounts', href: '/?category=accounts' },
  { label: 'Game Top-Ups', href: '/?category=top-ups' },
];

const supportLinks = [
  { label: 'My Orders', href: '/orders' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'FAQ', href: '/#faq' },
  {
    label: 'Contact Support',
    href: 'mailto:support@nexusstore.com',
  },
];

const legalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund-policy' },
];

const trustFeatures = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Codes delivered in seconds',
    color: 'text-[#10B981]',
    background: 'bg-[#10B981]/10',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Protected digital checkout',
    color: 'text-[#6366F1]',
    background: 'bg-[#6366F1]/10',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Help when you need it',
    color: 'text-[#F59E0B]',
    background: 'bg-[#F59E0B]/10',
  },
  {
    icon: CreditCard,
    title: 'Trusted Marketplace',
    description: 'Quality digital products',
    color: 'text-sky-400',
    background: 'bg-sky-400/10',
  },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-[#1F2937] bg-[#090D16]">
      <div className="border-b border-[#1F2937]">
        <div className="mx-auto grid max-w-360 grid-cols-1 divide-y divide-[#1F2937] px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-4">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="flex items-center gap-3 px-2 py-6 sm:px-5"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${feature.background}`}
                >
                  <Icon
                    className={`size-5 ${feature.color}`}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="font-semibold text-white">
                    {feature.title}
                  </p>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-360 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="NEXUS STORE home"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Gamepad2
                className="size-6 text-white"
                aria-hidden="true"
              />
            </span>

            <span className="font-bold tracking-tight text-white">
              NEXUS STORE
            </span>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Your trusted marketplace for digital gift cards, game
            keys, gaming accounts, and fast game top-ups.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:support@nexusstore.com"
              className="flex size-10 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-slate-400 transition-colors hover:border-[#6366F1] hover:text-white"
              aria-label="Email NEXUS STORE support"
              title="Email Support"
            >
              <Mail className="size-5" aria-hidden="true" />
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-slate-400 transition-colors hover:border-[#6366F1] hover:text-white"
              aria-label="Join NEXUS STORE on Discord"
              title="Discord Community"
            >
              <MessageCircle
                className="size-5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-white">Shop</h2>

          <ul className="mt-4 space-y-3">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-[#818CF8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Support</h2>

          <ul className="mt-4 space-y-3">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-[#818CF8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Legal</h2>

          <ul className="mt-4 space-y-3">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-[#818CF8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1F2937]">
        <div className="mx-auto flex max-w-360 flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear ?? ''} NEXUS STORE. All rights reserved.
          </p>

          <p className="flex items-center gap-2">
            <ShieldCheck
              className="size-4 text-[#10B981]"
              aria-hidden="true"
            />
            Secure digital marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}