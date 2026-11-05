/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { type JSX } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { BsWhatsapp } from 'react-icons/bs';
import { BsFillHouseFill } from 'react-icons/bs';
import { CiCirclePlus } from 'react-icons/ci';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSubmitContactUs } from '@/api/contact.api';

const contactFaqs = [
  {
    q: 'I registered but have not received a verification email. What should I do?',
    a: 'Please check your spam or junk folder first. If you still cannot find the email, write to support@fracto.com with your registered mobile number and we will resolve it within one business day.',
  },
  {
    q: 'My KYC documents were rejected. What are the reasons and next steps?',
    a: 'KYC documents may be rejected due to image quality issues, mismatched details, or unsupported document types. You will receive an email explaining the reason. You may re-submit through your account dashboard. If the issue persists, contact coowners@fracto.com.',
  },
  {
    q: 'How do I update my registered mobile number or email address?',
    a: 'Account detail updates are handled by our support team for security purposes. Write to support@fracto.com from your registered email address with your request and a valid identity document.',
  },
  {
    q: 'I have made a payment. When will my participation be confirmed?',
    a: 'Participation confirmation is issued after both payment receipt and full documentation execution are complete. You will receive a confirmation email and dashboard update within 3-5 business days of both being received. If you have not received confirmation beyond this period, contact coowners@fracto.com with your transaction reference.',
  },
  {
    q: 'How do I download my investment documents or distribution statements?',
    a: 'All documents and statements are available in your Co-owner Dashboard under the Documents section. Log in to your account and navigate to the relevant asset to access them. If documents are missing, contact coowners@fracto.com.',
  },
  {
    q: 'I want to list my property on Fracto. How do I begin?',
    a: 'Write to assets@fracto.com with a brief overview of your property -- type, location, size, current occupancy or development stage, and your capital requirement. Our asset team will review your submission and get back to you within 2 business days to discuss the next steps.',
  },
  {
    q: 'How do I become a Channel Partner?',
    a: 'Visit the Channel Partners section under Know More, or write to partners@fracto.com. Our team will share the partner onboarding process, documentation requirements, and commission structure.',
  },
];

function ContactFaqItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-start text-[var(--fg)] font-24 shrink-0"
      >
        {item.q}
        <CiCirclePlus
          size={32}
          className={`transition-transform duration-300 ease-in-out text-[#4F86C0] shrink-0 hover:scale-105 ${open ? 'rotate-135' : ''}`}
        />
      </button>
      <div
        className={`transition-all overflow-hidden duration-300 text-[var(--fg)]/70 font-light text-justify ${
          open ? 'mt-4' : 'max-h-0'
        }`}
      >
        {item.a}
      </div>
      <div className="w-full mt-5">
        <div className="h-[1px] bg-[#4F86C0] scale-x-100 origin-left transition-transform duration-[1600ms] ease-in-out group-hover:scale-x-0" />
      </div>
    </div>
  );
}

const UnderlineInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  autoFocus = false,
  error,
}: any) => (
  <div className="flex flex-col w-full">
    <label className="text-[var(--fg)]/70 font-medium text-sm mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      className={`bg-transparent border-b py-2 focus:outline-none transition-colors text-[var(--fg)] placeholder:text-[var(--fg)]/40 font-medium ${
        error
          ? 'border-red-500'
          : 'border-[var(--fg)]/20 focus:border-[#4F86C0]'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const contactDetails = [
  {
    label: 'Company Name',
    value: 'Fracto',
    icon: BsFillHouseFill,
  },
  {
    label: 'Email',
    value: '[Add Email Address]',
    icon: HiOutlineMail,
  },
  {
    label: 'Phone',
    value: '[Add Phone Number]',
    icon: HiOutlinePhone,
  },
  {
    label: 'Office Address',
    value: '[Add Address]',
    icon: HiOutlineLocationMarker,
  },
  {
    label: 'WhatsApp',
    value: '[Add WhatsApp Number]',
    icon: BsWhatsapp,
  },
];

export default function ContactUs(): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    type: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutateAsync: submitContactUs, isPending: isSubmitting } =
    useSubmitContactUs();

  const handleInputChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.type.trim()) newErrors.type = 'Please select who you are';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await submitContactUs(formData);
      if (res?.success === false) {
        toast.error(
          res?.message || 'Failed to send your message. Please try again.'
        );
        return;
      }
      toast.success('Message sent — our team will get back to you shortly.');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        city: '',
        type: '',
        message: '',
      });
      setErrors({});
    } catch (err: any) {
      toast.error(
        err?.message || 'Failed to send your message. Please try again.'
      );
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="bg-[var(--bg)] text-[var(--fg)] font-work transition-colors duration-300 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 pb-16 pt-32 md:pt-40 lg:pt-48">
        <motion.div
          className="text-center mb-12"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1 className="font-48 font-bold mb-4" variants={fadeInUp}>
            Contact Fracto
          </motion.h1>
          <motion.p className="font-24 font-bold text-gray-500 dark:text-gray-400 max-w-5xl mx-auto">
            We Are Here to Help.
          </motion.p>
          <motion.p
            className="font-20 text-gray-500 dark:text-gray-400 max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            Whether you are setting up your account, reviewing an opportunity,
            navigating documentation, or looking for a specific answer — our
            support team is available and ready to assist. Reach out through any
            of the channels below and we will get back to you promptly.
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-[var(--card)] shadow-2xl rounded-[2rem] p-2 border border-[var(--fg)]/10 flex flex-col lg:flex-row mb-24 min-h-[500px] "
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          <div className="lg:w-[40%] p-8 md:p-12 rounded-[1.5rem] text-white relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4F46E5] to-[#2563EB]">
            {/* Glass decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="font-36 font-bold mb-3">Contact Details</h2>

              <p className="font-18 text-white/80 font-light mb-10">
                Say something to start a live chat!
              </p>

              <div className="space-y-8">
                {contactDetails.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-6 group">
                      {/* Left side */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <Icon className="text-white text-2xl" />
                        </div>

                        <p className="text-white/50 text-sm">{item.label}</p>
                      </div>

                      {/* Right side */}
                      <p className="font-18 font-light text-white/90 text-right">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-[60%] p-8 md:p-14 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10 mb-12">
              <UnderlineInput
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={errors.name}
                autoFocus
              />

              <UnderlineInput
                label="Email Address"
                type="email"
                placeholder="support@hof.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
              />

              <UnderlineInput
                label="Mobile Number"
                type="text"
                placeholder="+1 012 3456 789"
                value={formData.mobile}
                onChange={handleInputChange('mobile')}
                error={errors.mobile}
              />

              <UnderlineInput
                label="City"
                placeholder="New York"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={errors.city}
              />
            </div>

            {/* Role Selection */}
            <div className="mb-14">
              <label className="text-[var(--fg)]/70 font-medium text-sm mb-4 block">
                I am a: <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap gap-6">
                {[
                  'Investor',
                  'Asset Owner',
                  'Channel Partner',
                  'Trustee',
                  'Other',
                ].map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={role}
                      checked={formData.type === role}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, type: '' }));
                      }}
                      className="accent-[#4F86C0] w-4 h-4"
                    />
                    <span className="text-[var(--fg)] font-medium text-sm">
                      {role}
                    </span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="text-red-500 text-xs mt-2">{errors.type}</p>
              )}
            </div>

            <div className="mb-14">
              <label className="text-[var(--fg)]/70 font-medium text-sm mb-1 block">
                Message <span className="text-red-500">*</span>
              </label>

              <textarea
                className={`w-full bg-transparent border-b focus:outline-none transition-colors text-[var(--fg)] placeholder:text-[var(--fg)]/40 font-medium resize-none ${
                  errors.message
                    ? 'border-red-500'
                    : 'border-[var(--fg)]/20 focus:border-[#4F86C0]'
                }`}
                placeholder="Write your message..."
                value={formData.message}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, message: '' }));
                }}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            <div className="flex justify-end mt-auto">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:brightness-110 transition-all text-white px-10 py-3 rounded-xl font-semibold font-16 shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting ? 'Sending...' : 'Request a Callback'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 className="font-40 font-bold mb-10" variants={fadeInUp}>
            Get In Touch
          </motion.h2>
          {(() => {
            const contacts = [
              {
                title: 'General Enquiries',
                desc: 'For questions about the platform, how it works, or any general information about Fracto.',
                email: 'support@fracto.com',
                response: 'Within 2 business days',
              },
              {
                title: 'Investor Support',
                desc: 'Already registered? For help with your account, KYC process, dashboard access, or any participation-related query.',
                email: 'coowners@fracto.com',
                response: 'Within 1 business day',
              },
              {
                title: 'Asset Owner & Listing Support',
                desc: 'Interested in listing a property or asset? For structuring queries, documentation guidance, and listing eligibility.',
                email: 'assets@fracto.com',
                response: 'Within 2 business days',
              },
              {
                title: 'Channel Partner Support',
                desc: 'For partner onboarding, commission queries, lead tracking, or any partnership-related assistance.',
                email: 'partners@fracto.com',
                response: 'Within 2 business days',
              },
              {
                title: 'Compliance & Legal Queries',
                desc: 'For questions related to documentation, platform compliance, or regulatory matters.',
                email: 'compliance@fracto.com',
                response: 'Within 3 business days',
              },
            ];
            const CardItem = ({
              item,
              idx,
            }: {
              item: (typeof contacts)[0];
              idx: number;
            }) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-[var(--inner-card)] p-6 md:p-8 rounded-[1.5rem] border border-[var(--fg)]/5 hover:border-[#4F46E5]/40 hover:shadow-lg hover:shadow-[#4F46E5]/10 hover:-translate-y-1 hover:bg-[#4F46E5]/5 transition-all duration-300 flex flex-col gap-3 cursor-default"
              >
                <h3 className="font-20 font-bold text-[#4F46E5]">
                  {item.title}
                </h3>
                <p className="font-16 text-[var(--fg)]/70 font-light leading-relaxed flex-1">
                  {item.desc}
                </p>
                <div className="border-t border-[var(--fg)]/5 pt-3 space-y-1">
                  <p className="font-14 text-[var(--fg)]/50">
                    <span className="font-medium text-[var(--fg)]/70">
                      Email:{' '}
                    </span>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-[#60A5FA] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.email}
                    </a>
                  </p>
                  <p className="font-14 text-[var(--fg)]/50">
                    <span className="font-medium text-[var(--fg)]/70">
                      Response Time:{' '}
                    </span>
                    {item.response}
                  </p>
                </div>
              </motion.div>
            );
            return (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contacts.slice(0, 3).map((item, idx) => (
                    <CardItem key={idx} item={item} idx={idx} />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:w-2/3 mx-auto">
                  {contacts.slice(3).map((item, idx) => (
                    <CardItem key={idx + 3} item={item} idx={idx + 3} />
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>

        <motion.div
          className="mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="font-40 font-bold mb-10 text-center"
            variants={fadeInUp}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {contactFaqs.map((item, index) => (
              <ContactFaqItem key={index} item={item} />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative bg-[var(--card)] rounded-[2rem] p-12 md:p-16 lg:p-20 text-center overflow-hidden border border-[var(--fg)]/10 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Background layered effect matching About Us footer */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#4F46E5]/5 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-48 font-bold mb-6 text-[var(--fg)]">
              Our Approach
            </h2>
            <p className="font-20 max-w-3xl mx-auto leading-relaxed text-[var(--fg)]/70 font-light">
              Fracto is building the future of structured real estate
              participation. Let’s create ownership differently.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
