export function PuzzleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19.433 12.997c.042-.322.067-.651.067-.987 0-3.323-2.691-6.014-6.014-6.014-.336 0-.665.025-.987.067C11.76 4.224 10.042 3 8 3c-2.761 0-5 2.239-5 5 0 2.042 1.224 3.76 3.063 4.499-.042.322-.067.651-.067.987 0 3.323 2.691 6.014 6.014 6.014.336 0 .665-.025.987-.067.739 1.839 2.457 3.063 4.499 3.063 2.761 0 5-2.239 5-5 0-2.042-1.224-3.76-3.063-4.499z" />
    </svg>
  );
}
