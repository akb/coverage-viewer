import {ProjectCoverage, CoverageBlock} from './model/coverage';

declare namespace hljs {
  export function highlightLinesCode(block: HTMLElement, lines: Line[], numbers: boolean): void;
}

export interface Line {
  start: number;
  end: number;
  color: string;
}

export function highlightLines(path: string, coverage: Line[]) {
  const viewer = document.querySelector('code#viewer');
  hljs.highlightLinesCode(viewer as HTMLElement, coverage, true);
}

export default highlightLines;
