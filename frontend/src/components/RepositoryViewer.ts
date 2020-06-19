import m from 'mithril';

import global from '../global';
import Repository from '../model/repository';
import FileViewer from './FileViewer';

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

  view() {
    if (this.repository === undefined) {
      return m('section.section', 'Fetching repository from Github...');
    } else {
      return m('section.section',
        m('.container',
          m('.level',
            m('.level-left',
              m('.title', `${this.repository.owner}/${this.repository.name}`),
              m('.title', `Stars: ${this.repository.stars}`)
            ),

            m('.level-right',
              m('button.button.is-info', {
                onclick: () => this.repository && this.repository.runTests()
              }, 'RUN TESTS')
            )
          ),

          m('.box', m('.columns',
            m('.column.is-one-quarter',
              m('ul', this.repository.files.map(path => m('li', this.loadingFile
                ? path
                : m('a', {onclick: () => this.loadFile(path)}, path)
              )))
            ),

            m('.column', m(FileViewer, {
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
