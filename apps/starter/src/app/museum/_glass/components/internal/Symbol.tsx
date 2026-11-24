/* 博物館（見本サイト）用の写し。元は @zakisheriff/liquid-glass 4.0.3（Copyright (c) 2026 Zaki Sheriff、MIT License。全文は components/kit/liquid-glass/LICENSE） */
 
import React from 'react';

export interface SymbolProps extends React.HTMLAttributes<HTMLSpanElement> {
  source: string;
  size?: number;
}

/** A monochrome symbol mask: inherits the control's colour in either theme. */
export function Symbol({ source, size = 24, className, style, ...props }: SymbolProps) {
  const mask = `url("${source}")`;
  return (
    <span
      aria-hidden="true"
      {...props}
      className={['lg-symbol', className].filter(Boolean).join(' ')}
      style={{ '--lg-symbol-size': `${size}px`, WebkitMaskImage: mask, maskImage: mask, ...style } as React.CSSProperties}
    />
  );
}
