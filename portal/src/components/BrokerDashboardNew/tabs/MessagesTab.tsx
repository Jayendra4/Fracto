import MessagesChat from './MessagesChat';

export default function MessagesTab() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Messages
        </h1>
        <p className="text-xs md:text-sm text-gray-550 dark:text-gray-400 mt-1">
          Your Relationship Manager and lead-related queries.
        </p>
      </div>

      <MessagesChat />
    </div>
  );
}
