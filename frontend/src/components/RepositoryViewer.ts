import m from 'mithril';

import global from '../global';
import Repository from '../model/repository';
import FileViewer from './FileViewer';
import highlightLines from '../highlight';

interface Attrs {
  path: string;
}

class RepositoryViewer implements m.ClassComponent<Attrs> {
  repository?: Repository;
  file?: File;

  loadingRepository: boolean = false;
  loadingFile: boolean = false;

  filePath?: string;

  constructor({attrs}: m.CVnode<Attrs>) {
    const [owner, name] = attrs.path.split('/');
    if (owner.length < 1 || name.length < 1) return;
    this.loadingRepository = true;
    Repository.load(owner, name).then((repository) => {
      this.repository = new Repository(repository);
      this.loadingRepository = false;
      m.redraw();
    })
  }

  loadFile(path: string) {
    this.filePath = path;
    this.loadingFile = true;
    m.redraw();
  }

  fileLoaded() {
    this.loadingFile = false;
    m.redraw();
  }

  runTests() {
    if (!this.repository) return;
    this.repository.runTests().then((coverage) => {
      if (!this.repository) return;
      if (this.filePath && this.filePath.length > 0) {
        highlightLines(this.filePath, this.repository.coverageForFile(this.filePath));
      }
    });
  }

  view() {
    if (this.repository === undefined) {
      return m('section.section', 'Fetching repository from Github...');
    } else {
      return m('section.section',
        m('.container',
          m('.level.has-small-bottom-margin',
            m('.level-left',
              m('.level-item.is-size-5', `${this.repository.owner}/${this.repository.name}`),
              m('.level-item.is-size-5', `Stars: ${this.repository.stars}`)
            ),

            m('.level-right',
              m('button.button.is-primary.is-size-7.is-uppercase.has-text-weight-bold', {
                onclick: () => {this.runTests()}
              }, 'Run Tests')
            )
          ),

          m('.box.repository-viewer', m('.columns.is-gapless',
            m('.column.is-one-quarter.column-left.scroll-contents-vertical',
              m('header.column-header.is-size-5', 'Files'),
              m('ul.file-list',
                this.repository.files.map(path => m('li', this.loadingFile
                  ? path
                  : m('a', {onclick: () => this.loadFile(path)}, path)
                ))
              )
            ),

            m('.column.scroll-contents-vertical', m(FileViewer, {
              repository: this.repository,
              path: this.filePath || '',
              key: this.filePath || '',
              callback: () => { this.fileLoaded() },
            }))
          ))
        )
      );
    }
  }
}

export default RepositoryViewer;
