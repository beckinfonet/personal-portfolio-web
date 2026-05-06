// NO "use client" — RSC-friendly primitive
// CSS classes (.prompt-line, .prompt-dollar, .prompt-cmd, .cursor) defined in app/globals.css

interface PromptLineProps {
  cmd: string;
}

export function PromptLine({ cmd }: PromptLineProps) {
  return (
    <div className="prompt-line">
      <span className="prompt-dollar">$</span>
      <span className="prompt-cmd">{cmd}</span>
      <span className="cursor" aria-hidden="true" />
    </div>
  );
}
