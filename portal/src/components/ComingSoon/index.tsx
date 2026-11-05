import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[620px] text-[var(--fg)] text-center px-6"
      style={{
        backgroundImage: 'url("/images/headerbg.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <img
        src="/images/logo.png"
        alt="Logo"
        className=" mb-6 animate-fade-in"
      />

      <h1 className="text-5xl sm:text-6xl py-2 font-bold mb-4 bg-gradient-to-r from-[#EF7B00] to-[#7D4810] bg-clip-text text-transparent animate-pulse">
        Coming Soon
      </h1>

      <p className="text-[var(--fg)] text-lg sm:text-xl max-w-md">
        We’re working hard to bring you something amazing. Stay tuned!
      </p>

      <div className="mt-8 w-32 h-[3px] bg-gradient-to-r from-[#EF7B00] to-[#7D4810] rounded-full animate-pulse" />

      <p className="mt-10 text-sm text-[var(--fg)] ">
        © {new Date().getFullYear()} Fracto
      </p>
    </div>
  );
};

export default ComingSoon;
