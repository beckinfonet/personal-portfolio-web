// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.stack-pre-wrap, .stack-pre, .stack-copy, .json-key, .json-string,
//   .json-punc, .copy-button) defined in app/globals.css (appended in Plan 03-04).
//
// Hand-rolled JSON syntax highlighter (Fragments + spans). Adding a syntax-highlighter
// library would violate the "exactly two new prod deps total" CLAUDE.md constraint.

import { Fragment } from "react";
import type { StackCategory } from "@/lib/types";
import { CopyButton } from "@/app/components/primitives/copy-button";

interface StackViewProps {
  stack: StackCategory[];
}

export function StackView({ stack }: StackViewProps) {
  const stackJsonObject = Object.fromEntries(
    stack.map((c) => [c.category, c.items])
  );
  const stackJsonString = JSON.stringify(stackJsonObject, null, 2);

  return (
    <div className="content-block">
      <div className="stack-pre-wrap">
        <CopyButton
          value={stackJsonString}
          ariaLabel="Copy stack JSON"
          className="stack-copy"
        />
        <pre className="stack-pre">
          <span className="json-punc">{"{"}</span>
          {"\n"}
          {stack.map((cat, idx) => (
            <Fragment key={cat.category}>
              <span className="json-punc">{"  "}</span>
              <span className="json-key">{`"${cat.category}"`}</span>
              <span className="json-punc">{": ["}</span>
              {"\n"}
              {cat.items.map((item, i) => (
                <Fragment key={item}>
                  <span>{"    "}</span>
                  <span className="json-string">{`"${item}"`}</span>
                  {i < cat.items.length - 1 && (
                    <span className="json-punc">,</span>
                  )}
                  {"\n"}
                </Fragment>
              ))}
              <span className="json-punc">
                {"  ]"}
                {idx < stack.length - 1 ? "," : ""}
              </span>
              {"\n"}
            </Fragment>
          ))}
          <span className="json-punc">{"}"}</span>
        </pre>
      </div>
    </div>
  );
}
