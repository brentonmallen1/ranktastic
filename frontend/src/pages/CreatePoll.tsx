import { PollCreator } from '@/components/polls/PollCreator';

export function CreatePoll() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      <PollCreator />
    </div>
  );
}
