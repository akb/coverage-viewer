import m from 'mithril';

class LoadForm implements m.ClassComponent {
  path: string = '';

  submitLoadForm() {
    m.route.set('/repos/:path', {path: this.path});
  }

  view() {
    return m('section.hero.is-fullheight',
      m('.hero-body.columns.is-centered',
        m('.card.column.is-half.is-gapless',
          m('.card-content.has-text-centered',
            m('.title.is-size-5.has-text-weight-medium', 'Enter a Go repo to test:'),
            m('.field.is-horizontal',
              m('.field-label.is-normal.is-prefix',
                m('label.label.has-text-weight-medium', 'github.com/')
              ),
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
            m('a.button.card-footer-item.is-primary.is-size-7.is-uppercase.has-text-weight-bold', {
              onclick: () => this.submitLoadForm()
            }, 'Load')
          )
        )
      )
    );
  }
}

export default LoadForm;
