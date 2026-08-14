import React, { ReactElement, Suspense } from 'react';
import { render, RenderResult } from '@testing-library/react';

export function renderWithSuspense(ui: ReactElement): RenderResult {
  return render(React.createElement(Suspense, { fallback: null }, ui));
}
