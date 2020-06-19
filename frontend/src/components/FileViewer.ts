import m from 'mithril';

import global from '../global';
import Repository from '../model/repository';
import RepositoryFile from '../model/repository-file';
import {Line, highlightLines} from '../highlight';

declare namespace hljs {
  export function highlightBlock(block: HTMLElement): void;
  export function lineNumbersBlock(block: HTMLElement): void;
}

interface Attrs {
  repository: Repository;
  path: string;
  callback?: () => void;
}

class FileViewer implements m.ClassComponent<Attrs> {
  loadingFile: boolean = false;
  shouldHighlight: boolean = false;

  file?: RepositoryFile;

  constructor({attrs}: m.CVnode<Attrs>) {
    const {owner, name} = attrs.repository
    const path = attrs.path;
    if (path.length > 0) {
      this.loadingFile = true;
      RepositoryFile.load(owner, name, path).then((file: RepositoryFile) => {
        this.file = new RepositoryFile(file);
        this.loadingFile = false;
        this.shouldHighlight = true;
        m.redraw();
      });
    }
  }

  onupdate({attrs}: m.CVnode<Attrs>) {
    if (this.loadingFile) return;
    if (!this.shouldHighlight) return;
    this.shouldHighlight = false;
    const viewer = document.querySelector('code#viewer');
    hljs.highlightBlock(viewer as HTMLElement);
    hljs.lineNumbersBlock(viewer as HTMLElement);

    if (this.file && attrs.repository && attrs.repository.coverage) {
      const path = this.file.path;
      highlightLines(path, attrs.repository.coverageForFile(path));
    }

    if (attrs.callback) attrs.callback();
    this.loadingFile = false;
  }

  view() {
    if (this.loadingFile) {
      return m('.content', 'Loading file content...');
    } else {
      return this.file
      ? m('.content',
          m('pre', m('code#viewer.language-go', this.file.content))
        )
      : m('.content', m('dev', 'No file currently selected.'));
    }
  }
}

export default FileViewer;
