import m from 'mithril';

import global from './global';
import LoadForm from './components/LoadForm';
import RepositoryViewer from './components/RepositoryViewer';

global.debug = true;

m.route(document.body, '/', {
  '/': LoadForm,
  '/repos/:path': RepositoryViewer,
});
