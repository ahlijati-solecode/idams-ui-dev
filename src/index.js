import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProvideAuth } from './hooks';
import * as serviceWorker from './serviceWorker';
import configureStore from './stores/configure-store';
import './index.scss';

const store = configureStore();

const rootEl = document.getElementById('root');

ReactDOM.render(
  <Provider store={store}>
    <ProvideAuth>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <App />
      </BrowserRouter>
    </ProvideAuth>
  </Provider>,
  rootEl
);

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NextApp = require('./App').default;

    ReactDOM.render(
      <Provider store={store}>
        <ProvideAuth>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <NextApp />
          </BrowserRouter>
        </ProvideAuth>
      </Provider>,
      rootEl
    );
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
