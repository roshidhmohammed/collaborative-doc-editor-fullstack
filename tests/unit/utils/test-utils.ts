import { ReactElement, Suspense } from 'react';
import { render, RenderResult } from '@testing-library/react';

export function renderWithSuspense(ui: ReactElement): RenderResult {
  return render(<Suspense fallback={null}>{ui}</Suspense>);
}
