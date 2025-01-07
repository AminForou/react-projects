import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import QbLinksApp from './QbLinksApp';
import './styles.css';

ReactDOM.render(
  <Router>
    <QbLinksApp />
  </Router>,
  document.getElementById('root')
);
