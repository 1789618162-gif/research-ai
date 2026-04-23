type ExampleChipsProps = {
  examples: string[];
  onSelect: (example: string) => void;
};

export default function ExampleChips({ examples, onSelect }: ExampleChipsProps) {
  return (
    <div className="mt-6">
      <p className="text-sm text-neutral-500">试试这些：</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-3">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onSelect(example)}
            className="h-9 rounded-md border border-neutral-200 bg-white/60 px-3 text-sm font-medium text-neutral-600 transition duration-200 ease-out hover:border-neutral-400 hover:bg-white hover:text-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-200"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
