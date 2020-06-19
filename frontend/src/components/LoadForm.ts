import m from 'mithril';

class LoadForm implements m.ClassComponent {
  path: string = '';

  submitLoadForm() {
    m.route.set('/repos/:path', {path: this.path});
  }

  view() {
    return m('section.section', m('.container', m('.card',
      m('.card-content.has-text-centered',
        m('.title', 'Enter a Go repo to test:'),
        m('.field.is-horizontal',
          m('.field-label.is-normal', m('label.label', 'github.com/')),
          m('.field-body', m('.field', m('p.control',
            m('input.input', {
              type: 'text', oninput: (e: Event) => {
                this.path = (e.target as HTMLInputElement).value;
              }
            })
          )))
        )
      ),
      m('footer.card-footer',
        m('a.button.is-info', {onclick: () => this.submitLoadForm()}, 'LOAD')
      )
    )));
  }
}

export default LoadForm;
